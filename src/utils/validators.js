import { CATEGORIES } from '../domain/constants.js';
import { ValidationError } from '../domain/errors.js';

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');

// Every validator returns an object of field -> message. Empty object = valid.
export function validateRegister({ name, email, password }) {
  const f = {};
  if (!name || name.trim().length < 2) f.name = 'Enter your full name.';
  if (!isEmail(email)) f.email = 'Enter a valid email address.';
  if (!password || password.length < 6) f.password = 'Use at least 6 characters.';
  return f;
}

export function validateTask(d) {
  const f = {};
  const reward = Number(d.reward);
  if (!d.title || d.title.trim().length < 5) f.title = 'Give the task a title of at least 5 characters.';
  if (!d.description || d.description.trim().length < 20) f.description = 'Describe the task in at least 20 characters.';
  if (!CATEGORIES.includes(d.category)) f.category = 'Choose a category.';
  if (!d.deliverables || d.deliverables.trim().length < 5) f.deliverables = 'Say what you expect to receive.';
  if (!Number.isInteger(reward) || reward < 1 || reward > 100) f.reward = 'Enter a whole number from 1 to 100.';
  if (!d.deadline) f.deadline = 'Choose a deadline.';
  else if (d.deadline < new Date().toISOString().slice(0, 10)) f.deadline = 'The deadline cannot be in the past.';
  return f;
}

export const validateApplication = (message) =>
  !message || message.trim().length < 10 ? { message: 'Tell the requester why you are a good fit (10+ characters).' } : {};

export const validateSubmission = ({ text }) =>
  !text || text.trim().length < 10 ? { text: 'Describe what you are delivering (10+ characters).' } : {};

export const validateReview = ({ rating }) =>
  !Number.isInteger(rating) || rating < 1 || rating > 5 ? { rating: 'Choose 1 to 5 stars.' } : {};

// Throws a ValidationError if there are any problems.
export function assertValid(fields) {
  if (Object.keys(fields).length) throw new ValidationError(undefined, fields);
}

export const FILE_LIMITS = { maxFiles: 30, maxFileMB: 25, maxTotalMB: 100 };

// Checks the files a provider wants to attach.
export function validateFiles(files = []) {
  const { maxFiles, maxFileMB, maxTotalMB } = FILE_LIMITS;
  if (files.length > maxFiles) return { files: `You can attach up to ${maxFiles} files.` };
  const big = files.find((f) => f.size > maxFileMB * 1024 * 1024);
  if (big) return { files: `"${big.name}" is larger than ${maxFileMB} MB.` };
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > maxTotalMB * 1024 * 1024) return { files: `All files together must be under ${maxTotalMB} MB.` };
  return {};
}