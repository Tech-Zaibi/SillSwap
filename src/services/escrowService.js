import { User } from '../domain/models/User.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../domain/errors.js';
import { STATUS, assertTransition } from '../domain/taskStatus.js';
import { MAX_REVISIONS } from '../domain/constants.js';
import { validateSubmission, validateFiles, assertValid } from '../utils/validators.js';
import { tasksCol, usersCol, now, newId } from './storage.js';
import { saveFile, deleteFiles } from './fileStore.js';
import { logTransaction } from './tokenService.js';
import { notify } from './notificationService.js';

// ---------- small helpers ----------
const loadUsers = () => usersCol.all().map((r) => User.fromRecord(r));
const saveUsers = (list) => usersCol.save(list.map((u) => u.toRecord()));

function userById(list, id) {
  const u = list.find((x) => x.id === id);
  if (!u) throw new NotFoundError('User not found.');
  return u;
}

function loadTask(id) {
  const tasks = tasksCol.all();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new NotFoundError('Task not found.');
  return { tasks, task };
}

function allow(condition, message = 'You are not allowed to do this.') {
  if (!condition) throw new UnauthorizedError(message);
}

// Change status (checks the state machine) and write to the task history.
function move(task, to, note) {
  assertTransition(task.status, to);
  task.status = to;
  task.history.push({ status: to, note, at: now() });
}

// IMPORTANT PATTERN: every function below first does all checks and wallet
// changes in memory. Data is saved only at the end, so a failed action
// never leaves half-finished changes behind.

// 1. Requester accepts an application -> tokens are locked in escrow.
export async function acceptApplication(taskId, applicationId, actorId) {
  const { tasks, task } = loadTask(taskId);
  allow(task.requesterId === actorId, 'Only the requester can accept applications.');
  const app = task.applications.find((a) => a.id === applicationId);
  if (!app) throw new NotFoundError('Application not found.');
  assertTransition(task.status, STATUS.ASSIGNED);

  const users = loadUsers();
  const requester = userById(users, actorId);
  requester.wallet.lock(task.reward); // throws InsufficientTokensError if not enough

  task.providerId = app.providerId;
  task.applications.forEach((a) => { a.status = a.id === app.id ? 'accepted' : 'rejected'; });
  move(task, STATUS.ASSIGNED, `${task.reward} tokens locked in escrow`);

  saveUsers(users);
  tasksCol.save(tasks);
  logTransaction(actorId, 'locked', task.reward, task.id, `Escrow for "${task.title}"`);
  notify(app.providerId, `You were selected for "${task.title}". ${task.reward} tokens are locked in escrow.`, `/tasks/${task.id}`);
  task.applications
    .filter((a) => a.status === 'rejected')
    .forEach((a) => notify(a.providerId, `Another applicant was chosen for "${task.title}".`, `/tasks/${task.id}`));
}

// 2. Provider starts working.
export async function startWork(taskId, actorId) {
  const { tasks, task } = loadTask(taskId);
  allow(task.providerId === actorId, 'Only the assigned provider can start this task.');
  move(task, STATUS.IN_PROGRESS, 'Provider started work');
  tasksCol.save(tasks);
  notify(task.requesterId, `Work has started on "${task.title}".`, `/tasks/${task.id}`);
}

// 3. Provider submits the deliverable.
export async function submitWork(taskId, actorId, { text, link = '', files = [] }) {
  const { tasks, task } = loadTask(taskId);
  allow(task.providerId === actorId, 'Only the assigned provider can submit work.');
  assertValid({ ...validateSubmission({ text }), ...validateFiles(files) });
  assertTransition(task.status, STATUS.SUBMITTED); // check before saving any file

  // Keep earlier files (after a revision) unless new ones are attached.
  const oldFiles = task.submission?.files || [];
  let saved = oldFiles;
  if (files.length) {
    saved = [];
    try {
      for (const f of files) {
        const id = newId('f');
        await saveFile(id, f);
        saved.push({ id, name: f.webkitRelativePath || f.name, size: f.size, type: f.type || 'application/octet-stream' });
      }
    } catch (err) {
      await deleteFiles(saved.map((f) => f.id)).catch(() => {}); // clean up half-saved files
      throw err;
    }
  }

  task.submission = { text: text.trim(), link: link.trim(), files: saved, submittedAt: now() };
  move(task, STATUS.SUBMITTED, 'Work submitted');
  tasksCol.save(tasks);
  if (files.length) await deleteFiles(oldFiles.map((f) => f.id)).catch(() => {}); // remove replaced files
  notify(task.requesterId, `Work was submitted for "${task.title}". Please review it.`, `/tasks/${task.id}`);
}

// 4. Requester approves -> escrow tokens move to the provider.
export async function approveWork(taskId, actorId) {
  const { tasks, task } = loadTask(taskId);
  allow(task.requesterId === actorId, 'Only the requester can approve the work.');
  assertTransition(task.status, STATUS.COMPLETED);

  const users = loadUsers();
  const requester = userById(users, task.requesterId);
  const provider = userById(users, task.providerId);
  requester.wallet.releaseTo(provider.wallet, task.reward);
  move(task, STATUS.COMPLETED, `${task.reward} tokens released to ${provider.name}`);

  saveUsers(users);
  tasksCol.save(tasks);
  logTransaction(requester.id, 'spent', task.reward, task.id, `Paid for "${task.title}"`);
  logTransaction(provider.id, 'earned', task.reward, task.id, `Completed "${task.title}"`);
  notify(provider.id, `Your work on "${task.title}" was approved. You earned ${task.reward} tokens.`, '/wallet');
}

// 5. Requester asks for changes (limited rounds).
export async function requestRevision(taskId, actorId, note) {
  const { tasks, task } = loadTask(taskId);
  allow(task.requesterId === actorId, 'Only the requester can request a revision.');
  if (!note || note.trim().length < 5) throw new ValidationError(undefined, { text: 'Explain what should change (5+ characters).' });
  if (task.revisionCount >= MAX_REVISIONS) {
    throw new ValidationError(`You already used ${MAX_REVISIONS} revision rounds. Raise a dispute if the work is still not acceptable.`);
  }
  task.revisionCount += 1;
  task.revisionNote = note.trim();
  move(task, STATUS.IN_PROGRESS, `Revision requested: ${note.trim()}`);
  tasksCol.save(tasks);
  notify(task.providerId, `Changes were requested on "${task.title}".`, `/tasks/${task.id}`);
}

// 6. Either side can raise a dispute; an admin decides.
export async function raiseDispute(taskId, actorId, reason) {
  const { tasks, task } = loadTask(taskId);
  allow(actorId === task.requesterId || actorId === task.providerId, 'Only people on this task can raise a dispute.');
  if (!reason || reason.trim().length < 10) throw new ValidationError(undefined, { text: 'Explain the problem in at least 10 characters.' });
  move(task, STATUS.DISPUTED, `Dispute raised: ${reason.trim()}`);
  task.disputeReason = reason.trim();
  task.disputedBy = actorId;
  tasksCol.save(tasks);

  const other = actorId === task.requesterId ? task.providerId : task.requesterId;
  notify(other, `A dispute was raised on "${task.title}".`, `/tasks/${task.id}`);
  loadUsers().filter((u) => u.role === 'admin').forEach((a) => notify(a.id, `New dispute on "${task.title}".`, '/admin'));
}

// 7. Requester cancels an Open or Assigned task (locked tokens are refunded).
export async function cancelTask(taskId, actorId) {
  const { tasks, task } = loadTask(taskId);
  allow(task.requesterId === actorId, 'Only the requester can cancel this task.');
  assertTransition(task.status, STATUS.CANCELLED);

  const wasAssigned = task.status === STATUS.ASSIGNED;
  const users = loadUsers();
  if (wasAssigned) userById(users, actorId).wallet.refund(task.reward);
  move(task, STATUS.CANCELLED, wasAssigned ? 'Cancelled, tokens refunded' : 'Cancelled by requester');

  saveUsers(users);
  tasksCol.save(tasks);
  if (wasAssigned) {
    logTransaction(actorId, 'refund', task.reward, task.id, `Refund for "${task.title}"`);
    notify(task.providerId, `"${task.title}" was cancelled by the requester.`, `/tasks/${task.id}`);
  }
}

// 8. Admin settles a dispute: 'release' pays provider, 'refund' returns tokens.
export async function resolveDispute(taskId, adminId, decision) {
  const { tasks, task } = loadTask(taskId);
  const users = loadUsers();
  const admin = userById(users, adminId);
  allow(admin.can('resolveDisputes'), 'Only administrators can resolve disputes.');
  if (!['release', 'refund'].includes(decision)) throw new ValidationError('Choose release or refund.');

  const requester = userById(users, task.requesterId);
  const provider = userById(users, task.providerId);

  if (decision === 'release') {
    requester.wallet.releaseTo(provider.wallet, task.reward);
    move(task, STATUS.COMPLETED, `Admin released ${task.reward} tokens to ${provider.name}`);
  } else {
    requester.wallet.refund(task.reward);
    move(task, STATUS.CANCELLED, `Admin refunded ${task.reward} tokens to ${requester.name}`);
  }
  task.resolution = decision;
  saveUsers(users);
  tasksCol.save(tasks);

  if (decision === 'release') {
    logTransaction(requester.id, 'spent', task.reward, task.id, `Dispute resolved for "${task.title}"`);
    logTransaction(provider.id, 'earned', task.reward, task.id, `Dispute resolved for "${task.title}"`);
  } else {
    logTransaction(requester.id, 'refund', task.reward, task.id, `Dispute refund for "${task.title}"`);
  }
  [requester.id, provider.id].forEach((id) =>
    notify(id, `The dispute on "${task.title}" was resolved: ${decision === 'release' ? 'tokens released to the provider' : 'tokens refunded to the requester'}.`, `/tasks/${task.id}`)
  );
}
