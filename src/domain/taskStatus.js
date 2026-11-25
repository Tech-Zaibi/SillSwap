import { InvalidTransitionError } from './errors.js';

export const STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  COMPLETED: 'Completed',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
};

// A simple "state machine": for each status, which statuses may come next.
export const ALLOWED = {
  [STATUS.OPEN]: [STATUS.ASSIGNED, STATUS.CANCELLED],
  [STATUS.ASSIGNED]: [STATUS.IN_PROGRESS, STATUS.CANCELLED],
  [STATUS.IN_PROGRESS]: [STATUS.SUBMITTED, STATUS.DISPUTED],
  [STATUS.SUBMITTED]: [STATUS.COMPLETED, STATUS.IN_PROGRESS, STATUS.DISPUTED],
  [STATUS.DISPUTED]: [STATUS.COMPLETED, STATUS.CANCELLED],
  [STATUS.COMPLETED]: [],
  [STATUS.CANCELLED]: [],
};

export function canTransition(from, to) {
  return (ALLOWED[from] || []).includes(to);
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) throw new InvalidTransitionError(from, to);
}
