import jwt from "jsonwebtoken";
import User from "../../models/User.js";

// Helper: create a user directly and mint a JWT for them. Skips the
// register + OTP dance so tests stay focused on what they're testing.
export async function makeUserWithToken(overrides = {}) {
  const user = await User.create({
    username: overrides.username || `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    password: overrides.password || "test-password",
    ...overrides,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { user, token };
}
