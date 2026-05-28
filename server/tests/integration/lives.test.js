import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import User from "../../models/User.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("GET /api/lives", () => {
  test("returns lives + regen info for the signed-in player", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .get("/api/lives")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.livesRemaining).toBe(3);
    expect(res.body.maxLives).toBe(3);
    expect(res.body.regenIntervalMs).toBeGreaterThan(0);
  });

  test("401 without a token", async () => {
    const res = await request(app).get("/api/lives");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/lives/use", () => {
  test("decrements lives", async () => {
    const { user, token } = await makeUserWithToken();
    const res = await request(app)
      .post("/api/lives/use")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.livesRemaining).toBe(2);
    const fresh = await User.findById(user._id);
    expect(fresh.livesRemaining).toBe(2);
  });

  test("409 when out of lives", async () => {
    const { user, token } = await makeUserWithToken();
    // Drain manually so we don't depend on the 30-min cooldown timing
    // of repeated useLife() calls.
    user.livesRemaining = 0;
    user.lastLifeRegen = new Date(Date.now()); // freshly set so no regen yet
    await user.save();

    const res = await request(app)
      .post("/api/lives/use")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(409);
    expect(res.body.livesRemaining).toBe(0);
  });
});
