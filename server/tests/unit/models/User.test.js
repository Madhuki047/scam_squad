import { connectTestDB, clearTestDB, disconnectTestDB } from "../../helpers/db.js";
import User from "../../../models/User.js";

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("User model", () => {
  test("hashes the password on first save", async () => {
    const user = await User.create({
      username: "hashme",
      password: "plaintext1",
    });
    expect(user.password).not.toBe("plaintext1");
    expect(user.password.length).toBeGreaterThan(20);
  });

  test("comparePassword returns true for the correct password, false otherwise", async () => {
    const user = await User.create({
      username: "comparer",
      password: "correcthorse",
    });
    expect(await user.comparePassword("correcthorse")).toBe(true);
    expect(await user.comparePassword("wrong")).toBe(false);
  });

  test("does NOT re-hash the password when other fields are saved", async () => {
    const user = await User.create({
      username: "stable",
      password: "stayhashed1",
    });
    const originalHash = user.password;
    user.points = 99;
    await user.save();
    expect(user.password).toBe(originalHash);
  });

  test("legacy livesRemaining > 3 is clamped on save", async () => {
    const user = new User({
      username: "legacy",
      password: "validpass1",
      livesRemaining: 9,
    });
    await user.save();
    expect(user.livesRemaining).toBe(3);
  });

  test("rejects a username shorter than 3 chars", async () => {
    await expect(
      User.create({ username: "ab", password: "validpass1" }),
    ).rejects.toThrow();
  });
});
