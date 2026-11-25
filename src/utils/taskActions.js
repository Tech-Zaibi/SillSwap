import { STATUS } from '../domain/taskStatus.js';

// Returns a short "what should I do next?" hint for this user, or null.
export function actionHint(task, userId) {
  const isRequester = task.requesterId === userId;
  const isProvider = task.providerId === userId;
  if (isRequester) {
    if (task.status === STATUS.OPEN) {
      const n = task.applications.filter((a) => a.status === 'pending').length;
      return n ? `${n} application${n > 1 ? 's' : ''} to review` : null;
    }
    if (task.status === STATUS.SUBMITTED) return 'Review the submitted work';
    if (task.status === STATUS.COMPLETED && !task.reviewed) return 'Leave a review';
  }
  if (isProvider) {
    if (task.status === STATUS.ASSIGNED) return 'Start working';
    if (task.status === STATUS.IN_PROGRESS) return 'Submit your work';
  }
  return null;
}
