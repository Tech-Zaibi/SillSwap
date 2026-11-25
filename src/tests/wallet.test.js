import { Wallet } from '../domain/Wallet.js';
import { InsufficientTokensError, InvalidAmountError } from '../domain/errors.js';

describe('Wallet', () => {
  it('locks tokens', () => {
    const w = new Wallet(10);
    w.lock(4);
    expect(w.available).toBe(6);
    expect(w.locked).toBe(4);
  });
  it('rejects locking more than available', () => {
    expect(() => new Wallet(3).lock(5)).toThrow(InsufficientTokensError);
  });
  it('rejects zero, negative and decimal amounts', () => {
    const w = new Wallet(10);
    expect(() => w.lock(0)).toThrow(InvalidAmountError);
    expect(() => w.deposit(-2)).toThrow(InvalidAmountError);
    expect(() => w.lock(1.5)).toThrow(InvalidAmountError);
  });
  it('releases locked tokens to another wallet', () => {
    const a = new Wallet(10); const b = new Wallet(0);
    a.lock(5); a.releaseTo(b, 5);
    expect(a.locked).toBe(0);
    expect(b.available).toBe(5);
  });
  it('refunds locked tokens', () => {
    const w = new Wallet(10);
    w.lock(5); w.refund(5);
    expect(w.available).toBe(10);
    expect(w.locked).toBe(0);
  });
  it('cannot release or refund more than is locked', () => {
    const w = new Wallet(10);
    w.lock(2);
    expect(() => w.refund(3)).toThrow(InvalidAmountError);
    expect(() => w.releaseTo(new Wallet(), 3)).toThrow(InvalidAmountError);
  });
});
