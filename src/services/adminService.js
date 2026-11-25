import { User } from '../domain/models/User.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../domain/errors.js';
import { STATUS } from '../domain/taskStatus.js';
import { usersCol, tasksCol, transactionsCol } from './storage.js';
import { notify } from './notificationService.js';

function requireAdmin(adminId) {
  const rec = usersCol.all().find((u) => u.id === adminId);
  if (!rec || !User.fromRecord(rec).can('manageUsers')) throw new UnauthorizedError('Administrator access required.');
}

export async function getStats(adminId) {
  requireAdmin(adminId);
  const users = usersCol.all().filter((u) => u.role === 'user');
  const tasks = tasksCol.all();
  return {
    users: users.length,
    suspended: users.filter((u) => u.suspended).length,
    openTasks: tasks.filter((t) => t.status === STATUS.OPEN).length,
    activeTasks: tasks.filter((t) => [STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.SUBMITTED].includes(t.status)).length,
    disputes: tasks.filter((t) => t.status === STATUS.DISPUTED).length,
    tokensInEscrow: usersCol.all().reduce((s, u) => s + (u.locked || 0), 0),
    tokensTotal: usersCol.all().reduce((s, u) => s + (u.available || 0) + (u.locked || 0), 0),
  };
}

export async function setSuspended(adminId, userId, suspended) {
  requireAdmin(adminId);
  const list = usersCol.all();
  const target = list.find((u) => u.id === userId);
  if (!target) throw new NotFoundError('User not found.');
  if (target.role === 'admin') throw new ValidationError('Administrator accounts cannot be suspended.');
  target.suspended = suspended;
  usersCol.save(list);
  notify(userId, suspended ? 'Your account was suspended by an administrator.' : 'Your account was reactivated.');
}

export async function listAllTasks(adminId) {
  requireAdmin(adminId);
  const name = (id) => usersCol.all().find((u) => u.id === id)?.name || '-';
  return tasksCol.all().map((t) => ({ ...t, requesterName: name(t.requesterId), providerName: t.providerId ? name(t.providerId) : null }));
}

export async function listAllTransactions(adminId) {
  requireAdmin(adminId);
  const name = (id) => usersCol.all().find((u) => u.id === id)?.name || '-';
  return transactionsCol.all().map((t) => ({ ...t, userName: name(t.userId) }));
}
