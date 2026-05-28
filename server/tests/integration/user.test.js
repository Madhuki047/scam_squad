import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import User from "../../models/User.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("GET /api/user/me", () => {
  test("returns the signed-in user without password", async () => {
    const { token } = await makeUserWithToken({ username: "me_tester" });
    const res = await request(app)
      .get("/api/user/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("me_tester");
    expect(res.body.user.password).toBeUndefined();
  });

  test("401 without a token", async () => {
    const res = await request(app).get("/api/user/me");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/user/me", () => {
  test("updates notification preferences", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .patch("/api/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ notifications: { dailyQuiz: false, lifeRegen: false } });

    expect(res.status).toBe(200);
    expect(res.body.user.settings.notifications.dailyQuiz).toBe(false);
    expect(res.body.user.settings.notifications.lifeRegen).toBe(false);
    // Untouched flag stays at default true.
    expect(res.body.user.settings.notifications.squadInvites).toBe(true);
  });

  test("rejects invalid email format", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .patch("/api/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "garbage" });
    expect(res.status).toBe(400);
  });

  test("adds an email", async () => {
    const { user, token } = await makeUserWithToken();
    const res = await request(app)
      .patch("/api/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "newmail@example.com" });

    expect(res.status).toBe(200);
    const fresh = await User.findById(user._id);
    expect(fresh.email).toBe("newmail@example.com");
  });

  test("rejects password change without current password", async () => {
    const { token } = await makeUserWithToken({ password: "originalpass1" });
    const res = await request(app)
      .patch("/api/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ newPassword: "brandnewpass1" });
    expect(res.status).toBe(401);
  });

  test("rejects short new password", async () => {
    const { token } = await makeUserWithToken({ password: "originalpass1" });
    const res = await request(app)
      .patch("/api/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "originalpass1", newPassword: "short" });
    expect(res.status).toBe(400);
  });

  test("changes the password when current password is correct", async () => {
    const { user, token } = await makeUserWithToken({
      password: "originalpass1",
    });
    const res = await request(app)
      .patch("/api/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "originalpass1", newPassword: "brandnewpass1" });

    expect(res.status).toBe(200);
    const fresh = await User.findById(user._id);
    expect(await fresh.comparePassword("brandnewpass1")).toBe(true);
    expect(await fresh.comparePassword("originalpass1")).toBe(false);
  });
});

describe("DELETE /api/user/me", () => {
  test("removes the signed-in account", async () => {
    const { user, token } = await makeUserWithToken();
    const res = await request(app)
      .delete("/api/user/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(await User.findById(user._id)).toBeNull();
  });
});

describe("GET /api/user/:id", () => {
  test("returns public projection for another player", async () => {
    const { user: other } = await makeUserWithToken({ username: "publicagent" });
    const { token } = await makeUserWithToken({ username: "viewer" });
    const res = await request(app)
      .get(`/api/user/${other._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("publicagent");
    // Public projection excludes private fields like password and email.
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.email).toBeUndefined();
  });

  test("404 when the id is unknown but valid", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .get("/api/user/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
