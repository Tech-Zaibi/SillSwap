import { register, login, getUser } from '../services/authService.js';
import { createTask, applyToTask, getTask } from '../services/taskService.js';
import * as escrow from '../services/escrowService.js';
import { addReview } from '../services/reviewService.js';
import { seedIfEmpty } from '../services/seed.js';
import { InsufficientTokensError, ValidationError, UnauthorizedError, InvalidTransitionError } from '../domain/errors.js';

const future = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
const taskData = (reward) => ({
  title: 'Write a Python script', description: 'Please write a script that renames files in a folder.',
  category: 'Programming', deliverables: 'A .py file and notes', reward, deadline: future,
});

let ali, sara, admin;
beforeEach(async () => {
  localStorage.clear();
  seedIfEmpty();
  ali = await register({ name: 'Ali Test', email: 'ali.test@x.com', password: 'secret1' });
  sara = await register({ name: 'Sara Test', email: 'sara.test@x.com', password: 'secret1' });
  admin = (await login('admin@skillswap.com', 'admin123'));
});

async function assigned(reward = 5) {
  const task = await createTask(ali.id, taskData(reward));
  const withApp = await applyToTask(task.id, sara.id, 'I can do this quickly.');
  await escrow.acceptApplication(task.id, withApp.applications[0].id, ali.id);
  return task.id;
}

describe('auth', () => {
  it('gives a signup bonus', async () => {
    expect((await getUser(ali.id)).wallet.available).toBe(10);
  });
  it('rejects duplicate emails', async () => {
    await expect(register({ name: 'Other', email: 'ALI.test@x.com', password: 'secret1' })).rejects.toThrow(ValidationError);
  });
  it('rejects wrong password', async () => {
    await expect(login('ali.test@x.com', 'wrong')).rejects.toThrow('incorrect');
  });
});

describe('escrow', () => {
  it('happy path moves tokens correctly', async () => {
    const id = await assigned(5);
    let a = await getUser(ali.id);
    expect([a.wallet.available, a.wallet.locked]).toEqual([5, 5]);
    await escrow.startWork(id, sara.id);
    await escrow.submitWork(id, sara.id, { text: 'Here is the script', link: '' });
    await escrow.approveWork(id, ali.id);
    a = await getUser(ali.id);
    const s = await getUser(sara.id);
    expect([a.wallet.available, a.wallet.locked]).toEqual([5, 0]);
    expect(s.wallet.available).toBe(15);
    expect((await getTask(id)).status).toBe('Completed');
    await addReview(id, ali.id, { rating: 5, comment: 'Great' });
    await expect(addReview(id, ali.id, { rating: 4 })).rejects.toThrow('already reviewed');
  });

  it('blocks accepting when the balance is too low and changes nothing', async () => {
    const task = await createTask(ali.id, taskData(50));
    const t = await applyToTask(task.id, sara.id, 'I can do this quickly.');
    await expect(escrow.acceptApplication(task.id, t.applications[0].id, ali.id)).rejects.toThrow(InsufficientTokensError);
    expect((await getTask(task.id)).status).toBe('Open');
    expect((await getUser(ali.id)).wallet.locked).toBe(0);
  });

  it('refunds when an assigned task is cancelled', async () => {
    const id = await assigned(5);
    await escrow.cancelTask(id, ali.id);
    const a = await getUser(ali.id);
    expect([a.wallet.available, a.wallet.locked]).toEqual([10, 0]);
  });

  it('only the right person can act', async () => {
    const id = await assigned(5);
    await expect(escrow.startWork(id, ali.id)).rejects.toThrow(UnauthorizedError);
    await expect(escrow.approveWork(id, sara.id)).rejects.toThrow(UnauthorizedError);
  });

  it('rejects invalid status jumps', async () => {
    const id = await assigned(5);
    await expect(escrow.approveWork(id, ali.id)).rejects.toThrow(InvalidTransitionError);
  });

  it('limits revision rounds', async () => {
    const id = await assigned(5);
    await escrow.startWork(id, sara.id);
    for (let i = 0; i < 2; i++) {
      await escrow.submitWork(id, sara.id, { text: 'Version ' + i + ' of the work' });
      await escrow.requestRevision(id, ali.id, 'Please change things');
    }
    await escrow.submitWork(id, sara.id, { text: 'Version 3 of the work' });
    await expect(escrow.requestRevision(id, ali.id, 'Again please')).rejects.toThrow(ValidationError);
  });

  it('admin resolves a dispute and total tokens stay the same', async () => {
    const id = await assigned(5);
    await escrow.startWork(id, sara.id);
    await escrow.raiseDispute(id, sara.id, 'The requester is not responding.');
    await escrow.resolveDispute(id, admin.id, 'refund');
    const a = await getUser(ali.id);
    const s = await getUser(sara.id);
    expect(a.wallet.available + a.wallet.locked + s.wallet.available + s.wallet.locked).toBe(20);
    expect(a.wallet.available).toBe(10);
    await expect(escrow.resolveDispute(id, ali.id, 'release')).rejects.toThrow();
  });
});
describe('profile', () => {
  it('saves, keeps and removes a profile photo', async () => {
    const { updateProfile } = await import('../services/authService.js');
    await updateProfile(ali.id, { name: 'Ali Test', bio: '', skills: [], avatar: 'data:image/jpeg;base64,AAAA' });
    expect((await getUser(ali.id)).avatar).toBe('data:image/jpeg;base64,AAAA');
    await updateProfile(ali.id, { name: 'Ali T', bio: '', skills: [] }); // avatar not sent = keep
    expect((await getUser(ali.id)).avatar).toBe('data:image/jpeg;base64,AAAA');
    await updateProfile(ali.id, { name: 'Ali T', bio: '', skills: [], avatar: null });
    expect((await getUser(ali.id)).avatar).toBeNull();
  });
});
