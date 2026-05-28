import mongoose from "mongoose";

// Test DB lifecycle. Each test file uses these from top-level hooks:
//   beforeAll(connectTestDB)
//   afterEach(clearTestDB)
//   afterAll(disconnectTestDB)
// Connection points at the in-memory MongoDB started by globalSetup.js.
export async function connectTestDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export async function clearTestDB() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
