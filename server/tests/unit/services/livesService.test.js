import {
  applyRegen,
  getNextRegenAt,
  useLife,
  grantLife,
  MAX_LIVES,
  REGEN_INTERVAL_MS,
} from "../../../services/livesService.js";

// Plain JS object that quacks like a Mongoose user doc — good enough for
// the pure helpers in livesService.
function makeUser(overrides = {}) {
  return {
    livesRemaining: 3,
    lastLifeRegen: new Date(),
    ...overrides,
  };
}

describe("applyRegen", () => {
  test("returns false when already at max and clock is fresh", () => {
    const user = makeUser({ livesRemaining: MAX_LIVES, lastLifeRegen: new Date() });
    expect(applyRegen(user)).toBe(false);
    expect(user.livesRemaining).toBe(MAX_LIVES);
  });

  test("clamps livesRemaining values that exceeded the cap (legacy data)", () => {
    const user = makeUser({ livesRemaining: 9 });
    expect(applyRegen(user)).toBe(true);
    expect(user.livesRemaining).toBe(MAX_LIVES);
  });

  test("no regen before one full interval has elapsed", () => {
    const user = makeUser({
      livesRemaining: 1,
      lastLifeRegen: new Date(Date.now() - REGEN_INTERVAL_MS + 1000),
    });
    expect(applyRegen(user)).toBe(false);
    expect(user.livesRemaining).toBe(1);
  });

  test("one full interval restores exactly one life", () => {
    const user = makeUser({
      livesRemaining: 1,
      lastLifeRegen: new Date(Date.now() - REGEN_INTERVAL_MS - 1000),
    });
    expect(applyRegen(user)).toBe(true);
    expect(user.livesRemaining).toBe(2);
  });

  test("two full intervals restore two lives", () => {
    const user = makeUser({
      livesRemaining: 0,
      lastLifeRegen: new Date(Date.now() - 2 * REGEN_INTERVAL_MS - 1000),
    });
    expect(applyRegen(user)).toBe(true);
    expect(user.livesRemaining).toBe(2);
  });

  test("never regenerates past the cap", () => {
    const user = makeUser({
      livesRemaining: 2,
      lastLifeRegen: new Date(Date.now() - 10 * REGEN_INTERVAL_MS),
    });
    applyRegen(user);
    expect(user.livesRemaining).toBe(MAX_LIVES);
  });
});

describe("useLife", () => {
  test("decrements a life and returns the new count", () => {
    const user = makeUser({ livesRemaining: 2 });
    expect(useLife(user)).toBe(1);
    expect(user.livesRemaining).toBe(1);
  });

  test("returns null when nothing to spend", () => {
    const user = makeUser({ livesRemaining: 0 });
    expect(useLife(user)).toBeNull();
    expect(user.livesRemaining).toBe(0);
  });

  test("spending from full starts the cooldown clock", () => {
    const oldDate = new Date(Date.now() - 10 * REGEN_INTERVAL_MS);
    const user = makeUser({
      livesRemaining: MAX_LIVES,
      lastLifeRegen: oldDate,
    });
    useLife(user);
    expect(user.livesRemaining).toBe(MAX_LIVES - 1);
    expect(user.lastLifeRegen.getTime()).toBeGreaterThan(oldDate.getTime());
  });
});

describe("grantLife", () => {
  test("adds a life when below the cap", () => {
    const user = makeUser({ livesRemaining: 1 });
    expect(grantLife(user)).toBe(true);
    expect(user.livesRemaining).toBe(2);
  });

  test("returns false when already at the cap", () => {
    const user = makeUser({ livesRemaining: MAX_LIVES });
    expect(grantLife(user)).toBe(false);
    expect(user.livesRemaining).toBe(MAX_LIVES);
  });
});

describe("getNextRegenAt", () => {
  test("returns null when at the cap", () => {
    const user = makeUser({ livesRemaining: MAX_LIVES });
    expect(getNextRegenAt(user)).toBeNull();
  });

  test("returns lastLifeRegen + interval when below the cap", () => {
    const last = Date.now() - 60_000;
    const user = makeUser({
      livesRemaining: 1,
      lastLifeRegen: new Date(last),
    });
    expect(getNextRegenAt(user)).toBe(last + REGEN_INTERVAL_MS);
  });
});
