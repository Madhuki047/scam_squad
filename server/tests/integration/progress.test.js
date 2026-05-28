import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import User from "../../models/User.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("GET /api/progress", () => {
  test("returns lives, points, and completed cases for the signed-in user", async () => {
    const { token } = await makeUserWithToken({ points: 250 });
    const res = await request(app)
      .get("/api/progress")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.progress.points).toBe(250);
    expect(res.body.progress.livesRemaining).toBe(3);
    expect(res.body.progress.completedCases).toEqual([]);
  });
});

describe("POST /api/progress/complete-intro", () => {
  test("flips introCompleted to true", async () => {
    const { user, token } = await makeUserWithToken();
    const res = await request(app)
      .post("/api/progress/complete-intro")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.progress.introCompleted).toBe(true);

    const fresh = await User.findById(user._id);
    expect(fresh.introCompleted).toBe(true);
  });
});

describe("POST /api/progress/complete-case", () => {
  test("validates caseId", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .post("/api/progress/complete-case")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: -1, difficulty: "rookie", result: "success" });
    expect(res.status).toBe(400);
  });

  test("validates difficulty", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .post("/api/progress/complete-case")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "expert", result: "success" });
    expect(res.status).toBe(400);
  });

  test("awards points and records completion for rookie success", async () => {
    const { user, token } = await makeUserWithToken({ points: 0 });
    const res = await request(app)
      .post("/api/progress/complete-case")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "rookie", result: "success" });

    expect(res.status).toBe(200);
    expect(res.body.pointsAwarded).toBe(300);
    expect(res.body.alreadyComplete).toBe(false);

    const fresh = await User.findById(user._id);
    expect(fresh.points).toBe(300);
    expect(fresh.completedCases).toHaveLength(1);
    expect(fresh.completedCases[0]).toMatchObject({
      caseId: 1,
      difficulty: "rookie",
    });
  });

  test("a duplicate rookie completion is idempotent (no double award)", async () => {
    const { user, token } = await makeUserWithToken({ points: 0 });
    await request(app)
      .post("/api/progress/complete-case")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "rookie", result: "success" });

    const second = await request(app)
      .post("/api/progress/complete-case")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "rookie", result: "success" });
    expect(second.status).toBe(200);
    expect(second.body.alreadyComplete).toBe(true);
    expect(second.body.pointsAwarded).toBe(0);

    const fresh = await User.findById(user._id);
    expect(fresh.points).toBe(300); // not 600
  });

  test("veteran completion requires rookie first", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .post("/api/progress/complete-case")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "veteran", result: "success" });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/progress/fail-attempt", () => {
  test("decrements a life", async () => {
    const { user, token } = await makeUserWithToken();
    const res = await request(app)
      .post("/api/progress/fail-attempt")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "rookie" });

    expect(res.status).toBe(200);
    expect(res.body.progress.livesRemaining).toBe(2);
    const fresh = await User.findById(user._id);
    expect(fresh.livesRemaining).toBe(2);
  });

  test("409 when out of lives", async () => {
    const { user, token } = await makeUserWithToken();
    user.livesRemaining = 0;
    user.lastLifeRegen = new Date();
    await user.save();

    const res = await request(app)
      .post("/api/progress/fail-attempt")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId: 1, difficulty: "rookie" });
    expect(res.status).toBe(409);
  });
});
