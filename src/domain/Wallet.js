import { InvalidAmountError, InsufficientTokensError } from './errors.js';

// Encapsulation: the balances are PRIVATE (#). Outside code cannot change them
// directly. It can only use deposit / lock / refund / releaseTo.
export class Wallet {
  #available;
  #locked;

  constructor(available = 0, locked = 0) {
    this.#available = available;
    this.#locked = locked;
  }

  get available() { return this.#available; }
  get locked() { return this.#locked; }
  get total() { return this.#available + this.#locked; }

  static #check(amount) {
    if (!Number.isInteger(amount) || amount <= 0) throw new InvalidAmountError();
  }

  deposit(amount) {
    Wallet.#check(amount);
    this.#available += amount;
  }

  // Move tokens from "available" to "locked" (escrow).
  lock(amount) {
    Wallet.#check(amount);
    if (amount > this.#available) throw new InsufficientTokensError(amount, this.#available);
    this.#available -= amount;
    this.#locked += amount;
  }

  // Give locked tokens back (task cancelled).
  refund(amount) {
    Wallet.#check(amount);
    if (amount > this.#locked) throw new InvalidAmountError();
    this.#locked -= amount;
    this.#available += amount;
  }

  // Pay locked tokens to another wallet (task approved).
  releaseTo(other, amount) {
    Wallet.#check(amount);
    if (amount > this.#locked) throw new InvalidAmountError();
    this.#locked -= amount;
    other.deposit(amount);
  }

  toJSON() {
    return { available: this.#available, locked: this.#locked };
  }
}
