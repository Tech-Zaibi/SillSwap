// Custom errors. Each one has its own name so the UI can show a clear message.
export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

// "fields" holds per-field messages, e.g. { email: 'Enter a valid email.' }
export class ValidationError extends AppError {
  constructor(message = 'Please fix the highlighted fields.', fields = {}) {
    super(message);
    this.fields = fields;
  }
}
export class AuthError extends AppError {}
export class UnauthorizedError extends AppError {}
export class NotFoundError extends AppError {}

export class InvalidAmountError extends AppError {
  constructor() {
    super('The amount must be a positive whole number of tokens.');
  }
}
export class InsufficientTokensError extends AppError {
  constructor(needed, available) {
    super(`You need ${needed} tokens but only have ${available} available.`);
    this.needed = needed;
    this.available = available;
  }
}
export class InvalidTransitionError extends AppError {
  constructor(from, to) {
    super(`A task cannot move from "${from}" to "${to}".`);
  }
}
