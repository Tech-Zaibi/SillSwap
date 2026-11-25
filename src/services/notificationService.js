import { notificationsCol, newId, now } from './storage.js';

// Internal helper used by other services.
export function notify(userId, text, link = '/notifications') {
  const list = notificationsCol.all();
  list.unshift({ id: newId('n'), userId, text, link, read: false, createdAt: now() });
  notificationsCol.save(list);
}

export async function listNotifications(userId) {
  return notificationsCol.all().filter((n) => n.userId === userId);
}

export function unreadCount(userId) {
  return notificationsCol.all().filter((n) => n.userId === userId && !n.read).length;
}

export async function markRead(id) {
  notificationsCol.save(notificationsCol.all().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export async function markAllRead(userId) {
  notificationsCol.save(notificationsCol.all().map((n) => (n.userId === userId ? { ...n, read: true } : n)));
}
