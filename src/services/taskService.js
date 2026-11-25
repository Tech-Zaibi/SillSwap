import { NotFoundError, UnauthorizedError, ValidationError } from '../domain/errors.js';
import { STATUS } from '../domain/taskStatus.js';
import { validateTask, validateApplication, assertValid } from '../utils/validators.js';
import { tasksCol, usersCol, newId, now } from './storage.js';
import { notify } from './notificationService.js';

const nameOf = (id) => usersCol.all().find((u) => u.id === id)?.name || 'Unknown user';

// Adds readable names to a task before sending it to the UI.
const decorate = (t) => ({
  ...t,
  requesterName: nameOf(t.requesterId),
  providerName: t.providerId ? nameOf(t.providerId) : null,
  applications: t.applications.map((a) => ({ ...a, providerName: nameOf(a.providerId) })),
});

export async function createTask(userId, data) {
  assertValid(validateTask(data));
  const owner = usersCol.all().find((u) => u.id === userId);
  if (!owner || owner.role !== 'user' || owner.suspended) {
    throw new UnauthorizedError('Your account cannot post tasks.');
  }
  const task = {
    id: newId('t'),
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    deliverables: data.deliverables.trim(),
    reward: Number(data.reward),
    deadline: data.deadline,
    requesterId: userId,
    providerId: null,
    status: STATUS.OPEN,
    applications: [],
    submission: null,
    revisionCount: 0,
    reviewed: false,
    createdAt: now(),
    history: [{ status: STATUS.OPEN, note: 'Task posted', at: now() }],
  };
  tasksCol.save([task, ...tasksCol.all()]);
  return decorate(task);
}

// filters: { search, category, minReward, maxReward, sort, status }
export async function listTasks({ search = '', category = '', minReward = '', maxReward = '', sort = 'newest', status = STATUS.OPEN } = {}) {
  const q = search.trim().toLowerCase();
  let list = tasksCol.all().filter((t) => !status || t.status === status);
  if (q) list = list.filter((t) => `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(q));
  if (category) list = list.filter((t) => t.category === category);
  if (minReward !== '') list = list.filter((t) => t.reward >= Number(minReward));
  if (maxReward !== '') list = list.filter((t) => t.reward <= Number(maxReward));

  const sorters = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    rewardHigh: (a, b) => b.reward - a.reward,
    rewardLow: (a, b) => a.reward - b.reward,
    deadline: (a, b) => a.deadline.localeCompare(b.deadline),
  };
  return list.sort(sorters[sort] || sorters.newest).map(decorate);
}

export async function getTask(id) {
  const task = tasksCol.all().find((t) => t.id === id);
  if (!task) throw new NotFoundError('This task does not exist or was removed.');
  return decorate(task);
}

export async function applyToTask(taskId, providerId, message) {
  assertValid(validateApplication(message));
  const tasks = tasksCol.all();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new NotFoundError('This task does not exist.');
  const user = usersCol.all().find((u) => u.id === providerId);
  if (!user || user.role !== 'user' || user.suspended) throw new UnauthorizedError('Your account cannot apply to tasks.');
  if (task.status !== STATUS.OPEN) throw new ValidationError('This task is no longer open.');
  if (task.requesterId === providerId) throw new ValidationError('You cannot apply to your own task.');
  if (task.applications.some((a) => a.providerId === providerId)) throw new ValidationError('You already applied to this task.');

  task.applications.push({ id: newId('a'), providerId, message: message.trim(), status: 'pending', createdAt: now() });
  tasksCol.save(tasks);
  notify(task.requesterId, `${user.name} applied to "${task.title}".`, `/tasks/${task.id}`);
  return decorate(task);
}

// Tasks the user posted, is working on, or applied to.
export async function listMyTasks(userId) {
  const all = tasksCol.all().map(decorate);
  return {
    posted: all.filter((t) => t.requesterId === userId),
    working: all.filter((t) => t.providerId === userId),
    applied: all.filter((t) => t.providerId !== userId && t.applications.some((a) => a.providerId === userId)),
  };
}
