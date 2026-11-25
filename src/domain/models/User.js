import { Wallet } from '../Wallet.js';

// Base class: every normal user can both post tasks (requester)
// and complete tasks (provider).
export class User {
  #wallet;

  constructor(record) {
    this.id = record.id;
    this.name = record.name;
    this.email = record.email;
    this.passwordHash = record.passwordHash;
    this.skills = record.skills || [];
    this.bio = record.bio || '';
    this.avatar = record.avatar || null;
    this.suspended = !!record.suspended;
    this.createdAt = record.createdAt;
    this.#wallet = new Wallet(record.available || 0, record.locked || 0);
  }

  get role() { return 'user'; }
  get wallet() { return this.#wallet; }

  // These two methods are overridden by Admin (polymorphism).
  getDashboardRoute() { return '/dashboard'; }
  getPermissions() { return ['browse', 'post', 'apply']; }

  can(permission) {
    return !this.suspended && this.getPermissions().includes(permission);
  }

  // Turn the object back into plain data for localStorage.
  toRecord() {
    return {
      id: this.id,
      role: this.role,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      skills: this.skills,
      bio: this.bio,
      avatar: this.avatar,
      suspended: this.suspended,
      createdAt: this.createdAt,
      ...this.#wallet.toJSON(),
    };
  }

  // Public info only (no email or password) for showing other people.
  toPublic() {
    return { id: this.id, name: this.name, skills: this.skills, bio: this.bio, avatar: this.avatar, createdAt: this.createdAt, role: this.role };
    }

  // Factory: picks the right class from stored data.
  static fromRecord(record) {
    return record.role === 'admin' ? new Admin(record) : new User(record);
  }
}

// Inheritance: Admin IS-A User with different behaviour.
export class Admin extends User {
  get role() { return 'admin'; }
  getDashboardRoute() { return '/admin'; }
  getPermissions() { return ['browse', 'manageUsers', 'resolveDisputes']; }
}
