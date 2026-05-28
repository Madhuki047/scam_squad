import { MongoMemoryServer } from "mongodb-memory-server";

// One in-memory MongoDB process for the entire test run. Each test file
// connects with mongoose; afterEach.js wipes collections so tests don't
// see each other's state.
export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = "test-secret-do-not-use-in-prod";
  process.env.CLIENT_URL = "http://localhost:5173";
  // Expose the instance so globalTeardown can stop it.
  globalThis.__MONGOD__ = mongod;
}
