import { User } from '../domain/models/User.js';
import { AuthError, NotFoundError, ValidationError } from '../domain/errors.js';
import { SIGNUP_BONUS } from '../domain/constants.js';
import { validateRegister, assertValid } from '../utils/validators.js';
import { hashPassword } from '../utils/hash.js';
import { storage, usersCol, newId, now } from './storage.js';
import { logTransaction } from './tokenService.js';
import { notify } from './notificationService.js';

const allUsers = () => usersCol.all().map((r) => User.fromRecord(r));

// Sync on purpose: it only reads the saved session.
export function getCurrentUser() {
  const id = storage.get('session', null);
  if (!id) return null;
  const rec = usersCol.all().find((u) => u.id === id);
  return rec ? User.fromRecord(rec) : null;
}

export async function register({ name, email, password, skills = [] }) {
  assertValid(validateRegister({ name, email, password }));
  const cleanEmail = email.trim().toLowerCase();
  if (usersCol.all().some((u) => u.email === cleanEmail)) {
    throw new ValidationError(undefined, { email: 'An account with this email already exists.' });
  }
  const user = new User({
    id: newId('u'),
    name: name.trim(),
    email: cleanEmail,
    passwordHash: hashPassword(password),
    skills,
    createdAt: now(),
  });
  user.wallet.deposit(SIGNUP_BONUS);
  usersCol.save([...usersCol.all(), user.toRecord()]);
  logTransaction(user.id, 'bonus', SIGNUP_BONUS, null, 'Welcome bonus');
  notify(user.id, `Welcome to SkillSwap! We added ${SIGNUP_BONUS} Skill Tokens to your wallet.`, '/wallet');
  storage.set('session', user.id);
  return user;
}

export async function login(email, password) {
  const rec = usersCol.all().find((u) => u.email === (email || '').trim().toLowerCase());
  if (!rec || rec.passwordHash !== hashPassword(password || '')) {
    throw new AuthError('Email or password is incorrect.');
  }
  if (rec.suspended) throw new AuthError('This account is suspended. Contact an administrator.');
  storage.set('session', rec.id);
  return User.fromRecord(rec);
}

// DEMO ONLY: jump into any account without a password.
export async function loginAs(userId) {
  const rec = usersCol.all().find((u) => u.id === userId);
  if (!rec) throw new NotFoundError('User not found.');
  storage.set('session', rec.id);
  return User.fromRecord(rec);
}

export function logout() {
  storage.remove('session');
}

export async function getUser(id) {
  const rec = usersCol.all().find((u) => u.id === id);
  if (!rec) throw new NotFoundError('That user does not exist.');
  return User.fromRecord(rec);
}

export async function listUsers() {
  return allUsers();
}

export async function updateProfile(userId, { name, bio, skills, avatar }) {
assertValid(!name || name.trim().length < 2 ? { name: 'Enter your full name.' } : {});
  const users = allUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new NotFoundError('User not found.');
  user.name = name.trim();
  user.bio = (bio || '').trim();
  user.skills = skills;
  if (avatar !== undefined) user.avatar = avatar;
  usersCol.save(users.map((u) => u.toRecord()));
  return user;
}
