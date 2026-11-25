import { UnauthorizedError, ValidationError, NotFoundError } from '../domain/errors.js';
import { STATUS } from '../domain/taskStatus.js';
import { validateReview, assertValid } from '../utils/validators.js';
import { reviewsCol, tasksCol, usersCol, newId, now } from './storage.js';
import { notify } from './notificationService.js';

// Only the requester can review the provider, once, after the task is completed.
export async function addReview(taskId, reviewerId, { rating, comment = '' }) {
  assertValid(validateReview({ rating }));
  const tasks = tasksCol.all();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new NotFoundError('Task not found.');
  if (task.requesterId !== reviewerId) throw new UnauthorizedError('Only the requester can leave a review.');
  if (task.status !== STATUS.COMPLETED) throw new ValidationError('You can review only after the task is completed.');
  if (task.reviewed) throw new ValidationError('You already reviewed this task.');

  const reviewer = usersCol.all().find((u) => u.id === reviewerId);
  reviewsCol.save([
    { id: newId('r'), taskId, providerId: task.providerId, reviewerId, reviewerName: reviewer?.name || 'User', taskTitle: task.title, rating, comment: comment.trim(), createdAt: now() },
    ...reviewsCol.all(),
  ]);
  task.reviewed = true;
  tasksCol.save(tasks);
  notify(task.providerId, `You received a ${rating}-star review for "${task.title}".`, `/users/${task.providerId}`);
}

export async function getReviewsForUser(userId) {
  return reviewsCol.all().filter((r) => r.providerId === userId);
}

export async function getReviewForTask(taskId) {
  return reviewsCol.all().find((r) => r.taskId === taskId) || null;
}

export async function getRating(userId) {
  const list = reviewsCol.all().filter((r) => r.providerId === userId);
  if (!list.length) return { average: 0, count: 0 };
  const average = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { average: Math.round(average * 10) / 10, count: list.length };
}
