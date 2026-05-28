import request from "supertest";
import createApp from "../../app.js";

const app = createApp();

describe("GET /api/health", () => {
  test("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("unknown API routes", () => {
  test("/api/<unknown> returns 404 JSON", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
