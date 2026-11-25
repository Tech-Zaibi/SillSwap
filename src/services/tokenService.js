import { transactionsCol, newId, now } from './storage.js';

// Internal helper: write one line in the transaction history.
export function logTransaction(userId, type, amount, taskId = null, note = '') {
  const list = transactionsCol.all();
  list.unshift({ id: newId('tx'), userId, type, amount, taskId, note, createdAt: now() });
  transactionsCol.save(list);
}

export async function getTransactions(userId) {
  return transactionsCol.all().filter((t) => t.userId === userId);
}

// Totals shown on the wallet page.
export async function getWalletSummary(userId) {
  const mine = transactionsCol.all().filter((t) => t.userId === userId);
  const sum = (type) => mine.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  return { earned: sum('earned'), spent: sum('spent'), bonus: sum('bonus') };
}
