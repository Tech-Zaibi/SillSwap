import { AppError } from '../domain/errors.js';

// Thin wrapper around localStorage. When you build a real backend, the
// services will call fetch() instead of using this file.
const PREFIX = 'skillswap:';

export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      throw new AppError('Could not save your data. Browser storage may be full.');
    }
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
};

export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
export const now = () => new Date().toISOString();

// A "collection" is just a list saved under one key (like a database table).
const collection = (name) => ({
  all: () => storage.get(name, []),
  save: (list) => storage.set(name, list),
});

export const usersCol = collection('users');
export const tasksCol = collection('tasks');
export const transactionsCol = collection('transactions');
export const notificationsCol = collection('notifications');
export const reviewsCol = collection('reviews');
