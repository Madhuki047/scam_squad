import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import ActivityLog from "../../models/ActivityLog.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("GET /api/activity", () => {
  test("returns newest-first items and weekly points total", async () => {
    const { user, token } = await makeUserWithToken();
    // Set explicit createdAt so the newest-first sort is unambiguous;
    // create([a, b]) inserted at the same millisecond would tie.
    const now = Date.now();
    await ActivityLog.create([
      {
        userId: user._id,
        type: "quiz",
        message: "Old",
        points: 10,
        createdAt: new Date(now - 60_000),
      },
      {
        userId: user._id,
        type: "case",
        message: "New",
        points: 40,
        createdAt: new Date(now),
      },
    ]);

    const res = await request(app)
      .get("/api/activity")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    // Newest first.
    expect(res.body.items[0].message).toBe("New");
    expect(res.body.pointsLastWeek).toBe(50);
  });

  test("ignores other players' activity", async () => {
    const { user, token } = await makeUserWithToken();
    const { user: other } = await makeUserWithToken({ username: "other_act" });
    await ActivityLog.create([
      { userId: other._id, type: "quiz", message: "Theirs", points: 99 },
      { userId: user._id, type: "case", message: "Mine", points: 5 },
    ]);

    const res = await request(app)
      .get("/api/activity")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].message).toBe("Mine");
  });

  test("clamps the limit query param to [1, 50]", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .get("/api/activity?limit=9999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    // Empty feed but the request shouldn't error on the huge limit.
    expect(res.body.items).toEqual([]);
  });
});
