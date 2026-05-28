import request from "supertest";
import jwt from "jsonwebtoken";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import User from "../../models/User.js";
import { saveOtp } from "../../services/otpStore.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("POST /api/auth/register", () => {
  test("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "" });
    expect(res.status).toBe(400);
  });

  test("rejects short passwords", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "agent_short", password: "abc" });
    expect(res.status).toBe(400);
  });

  test("rejects invalid emails", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "agent_email",
        password: "validpass123",
        email: "not-an-email",
      });
    expect(res.status).toBe(400);
  });

  test("creates an account and returns a session token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "agent_one", password: "validpass123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("agent_one");

    // Password must be hashed on disk, not stored plain.
    const fresh = await User.findOne({ username: "agent_one" });
    expect(fresh.password).not.toBe("validpass123");
  });

  test("rejects duplicate username", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "dup", password: "validpass123" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "dup", password: "validpass123" });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  test("rejects wrong password", async () => {
    await User.create({ username: "loginer", password: "validpass123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "loginer", password: "wrongone" });
    expect(res.status).toBe(401);
  });

  test("issues a full session token for an account without email", async () => {
    await User.create({ username: "noemail", password: "validpass123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "noemail", password: "validpass123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.pending).toBeUndefined();
  });

  test("issues a pending token + emailHint when account has email (2FA path)", async () => {
    await User.create({
      username: "withemail",
      password: "validpass123",
      email: "ag@example.com",
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "withemail", password: "validpass123" });

    expect(res.status).toBe(200);
    expect(res.body.otpRequired).toBe(true);
    expect(res.body.pendingToken).toBeDefined();
    expect(res.body.emailHint).toMatch(/@example\.com$/);
    const payload = jwt.verify(res.body.pendingToken, process.env.JWT_SECRET);
    expect(payload.pending).toBe(true);
  });
});

describe("POST /api/auth/verify-otp", () => {
  test("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({});
    expect(res.status).toBe(400);
  });

  test("rejects a non-pending token", async () => {
    const user = await User.create({
      username: "otpfull",
      password: "validpass123",
    });
    const fullToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ pendingToken: fullToken, code: "123456" });
    expect(res.status).toBe(400);
  });

  test("rejects a wrong code", async () => {
    const user = await User.create({
      username: "otpwrong",
      password: "validpass123",
      email: "ow@example.com",
    });
    const pending = jwt.sign(
      { id: user._id, pending: true },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );
    await saveOtp(String(user._id), "111111");
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ pendingToken: pending, code: "999999" });
    expect(res.status).toBe(401);
  });

  test("exchanges a valid pending token + code for a full session", async () => {
    const user = await User.create({
      username: "otpok",
      password: "validpass123",
      email: "ok@example.com",
    });
    const pending = jwt.sign(
      { id: user._id, pending: true },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );
    await saveOtp(String(user._id), "424242");
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ pendingToken: pending, code: "424242" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.pending).toBeUndefined();
  });
});

describe("POST /api/auth/logout", () => {
  test("returns ok (JWT revocation is client-side for now)", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
