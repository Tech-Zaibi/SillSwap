import { ALLOWED, STATUS, canTransition, assertTransition } from '../domain/taskStatus.js';
import { InvalidTransitionError } from '../domain/errors.js';

describe('task state machine', () => {
  it('allows every listed transition', () => {
    for (const [from, list] of Object.entries(ALLOWED)) {
      for (const to of list) expect(canTransition(from, to)).toBe(true);
    }
  });
  it('rejects every unlisted transition', () => {
    const all = Object.values(STATUS);
    for (const from of all) {
      for (const to of all) {
        if (!ALLOWED[from].includes(to)) expect(() => assertTransition(from, to)).toThrow(InvalidTransitionError);
      }
    }
  });
  it('Completed and Cancelled are final', () => {
    expect(ALLOWED[STATUS.COMPLETED]).toEqual([]);
    expect(ALLOWED[STATUS.CANCELLED]).toEqual([]);
  });
});
