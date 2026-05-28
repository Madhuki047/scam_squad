import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("GET /api/leaderboard", () => {
  test("ranks players by points descending", async () => {
    const { token } = await makeUserWithToken({ username: "lb_a", points: 50 });
    await makeUserWithToken({ username: "lb_b", points: 200 });
    await makeUserWithToken({ username: "lb_c", points: 100 });

    const res = await request(app)
      .get("/api/leaderboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.items.map((i) => i.username)).toEqual(["lb_b", "lb_c", "lb_a"]);
    expect(res.body.items[0].rank).toBe(1);
    expect(res.body.items[0].points).toBe(200);
  });

  test("respects limit and offset", async () => {
    const { token } = await makeUserWithToken({ points: 10 });
    for (let i = 0; i < 5; i++) {
      await makeUserWithToken({ username: `paginee_${i}`, points: 100 - i });
    }

    const res = await request(app)
      .get("/api/leaderboard?limit=2&offset=2")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(res.body.items[0].rank).toBe(3);
    expect(res.body.items[1].rank).toBe(4);
  });
});

describe("GET /api/leaderboard/me", () => {
  test("returns my rank position", async () => {
    await makeUserWithToken({ username: "rich1", points: 1000 });
    await makeUserWithToken({ username: "rich2", points: 500 });
    const { token } = await makeUserWithToken({ username: "midplayer", points: 100 });
    await makeUserWithToken({ username: "poor1", points: 0 });

    const res = await request(app)
      .get("/api/leaderboard/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.rank).toBe(3); // 2 players have strictly more points
    expect(res.body.points).toBe(100);
  });
});
