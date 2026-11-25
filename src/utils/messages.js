import { AppError } from '../domain/errors.js';

// Turn any error into text that is safe and friendly to show.
export function errorMessage(err) {
  if (err instanceof AppError) return err.message;
  console.error(err);
  return 'Something went wrong. Please try again.';
}
