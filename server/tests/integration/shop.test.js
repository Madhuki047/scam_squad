import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import User from "../../models/User.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("GET /api/shop", () => {
  test("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/shop");
    expect(res.status).toBe(401);
  });

  test("returns catalog, points, and inventory for the signed-in user", async () => {
    const { token } = await makeUserWithToken({ points: 500 });
    const res = await request(app)
      .get("/api/shop")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.points).toBe(500);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);

    const ids = res.body.items.map((i) => i.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "magnifier",
        "time",
        "second",
        "hint",
        "skin",
        "badge",
        "title",
      ]),
    );

    // The internal `field` mapping must not leak to the client.
    for (const item of res.body.items) {
      expect(item).not.toHaveProperty("field");
    }

    expect(res.body.inventory).toEqual(
      expect.objectContaining({
        magnifier: 0,
        skinOwned: false,
      }),
    );
  });
});

describe("POST /api/shop/buy/:itemId", () => {
  test("rejects unknown items", async () => {
    const { token } = await makeUserWithToken({ points: 1000 });
    const res = await request(app)
      .post("/api/shop/buy/totally-fake")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test("rejects when the player can't afford the item", async () => {
    const { user, token } = await makeUserWithToken({ points: 10 });
    const res = await request(app)
      .post("/api/shop/buy/magnifier") // costs 150
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    const fresh = await User.findById(user._id);
    expect(fresh.points).toBe(10); // no deduction on failure
    expect(fresh.inventory.magnifier).toBe(0);
  });

  test("consumable purchase deducts points and increments the counter", async () => {
    const { user, token } = await makeUserWithToken({ points: 500 });

    const first = await request(app)
      .post("/api/shop/buy/magnifier") // 150
      .set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.points).toBe(350);
    expect(first.body.inventory.magnifier).toBe(1);

    const second = await request(app)
      .post("/api/shop/buy/magnifier")
      .set("Authorization", `Bearer ${token}`);
    expect(second.status).toBe(200);
    expect(second.body.points).toBe(200);
    expect(second.body.inventory.magnifier).toBe(2);

    const fresh = await User.findById(user._id);
    expect(fresh.points).toBe(200);
    expect(fresh.inventory.magnifier).toBe(2);
  });

  test("cosmetic purchase flips owned flag and rejects a second buy", async () => {
    const { user, token } = await makeUserWithToken({ points: 1000 });

    const first = await request(app)
      .post("/api/shop/buy/skin") // 500
      .set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.points).toBe(500);
    expect(first.body.inventory.skinOwned).toBe(true);

    const second = await request(app)
      .post("/api/shop/buy/skin")
      .set("Authorization", `Bearer ${token}`);
    expect(second.status).toBe(400); // already owned, no double-charge
    const fresh = await User.findById(user._id);
    expect(fresh.points).toBe(500);
  });
});
