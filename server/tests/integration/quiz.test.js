import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import QuizQuestion from "../../models/QuizQuestion.js";
import { clearSession } from "../../services/quizSessionStore.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

// The quiz controller pulls random questions from the QuizQuestion
// collection AND ramps difficulty when the player answers correctly
// (2-in-a-row → level up). Seed at every difficulty so a 5-question
// session can never hit the 404 "no more questions" path.
async function seedQuestions() {
  const docs = [];
  for (const difficulty of ["easy", "medium", "hard"]) {
    for (let i = 0; i < 10; i++) {
      docs.push({
        question: `${difficulty} q ${i}`,
        options: ["a", "b", "c", "d"],
        correctIndex: 0,
        difficulty,
        category: "phishing",
      });
    }
  }
  await QuizQuestion.create(docs);
}

describe("GET /api/quiz/next", () => {
  test("issues a question without leaking the correct answer index", async () => {
    await seedQuestions();
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));

    const res = await request(app)
      .get("/api/quiz/next")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.question.text).toMatch(/easy q/i);
    expect(res.body.question.options).toHaveLength(4);
    expect(res.body.question.correctIndex).toBeUndefined();
    expect(res.body.progress).toEqual({ answered: 0, correct: 0, total: 5 });
  });

  test("refuses to serve a 2nd question while one is in progress", async () => {
    await seedQuestions();
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));

    await request(app)
      .get("/api/quiz/next")
      .set("Authorization", `Bearer ${token}`);

    const second = await request(app)
      .get("/api/quiz/next")
      .set("Authorization", `Bearer ${token}`);
    expect(second.status).toBe(400);
  });
});

describe("POST /api/quiz/answer", () => {
  test("rejects answers with no question in progress", async () => {
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));

    const res = await request(app)
      .post("/api/quiz/answer")
      .set("Authorization", `Bearer ${token}`)
      .send({ answerIndex: 0 });
    expect(res.status).toBe(400);
  });

  test("rejects out-of-range answer indices", async () => {
    await seedQuestions();
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));
    await request(app)
      .get("/api/quiz/next")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/api/quiz/answer")
      .set("Authorization", `Bearer ${token}`)
      .send({ answerIndex: 99 });
    expect(res.status).toBe(400);
  });

  test("correct answer reports correct=true and exposes the truth", async () => {
    await seedQuestions();
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));
    await request(app)
      .get("/api/quiz/next")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/api/quiz/answer")
      .set("Authorization", `Bearer ${token}`)
      .send({ answerIndex: 0 }); // correctIndex is 0 for every seed
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.correctIndex).toBe(0);
    expect(res.body.progress).toEqual({ answered: 1, correct: 1, total: 5 });
  });
});

describe("POST /api/quiz/complete", () => {
  test("refuses if no session exists", async () => {
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));
    const res = await request(app)
      .post("/api/quiz/complete")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test("refuses mid-session", async () => {
    await seedQuestions();
    const { user, token } = await makeUserWithToken();
    await clearSession(String(user._id));
    await request(app)
      .get("/api/quiz/next")
      .set("Authorization", `Bearer ${token}`);
    await request(app)
      .post("/api/quiz/answer")
      .set("Authorization", `Bearer ${token}`)
      .send({ answerIndex: 0 });

    const res = await request(app)
      .post("/api/quiz/complete")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test("full happy-path session: 5 correct answers awards an extra life", async () => {
    await seedQuestions();
    const { user, token } = await makeUserWithToken({ livesRemaining: 1 });
    await clearSession(String(user._id));

    for (let i = 0; i < 5; i++) {
      await request(app)
        .get("/api/quiz/next")
        .set("Authorization", `Bearer ${token}`);
      await request(app)
        .post("/api/quiz/answer")
        .set("Authorization", `Bearer ${token}`)
        .send({ answerIndex: 0 });
    }

    const complete = await request(app)
      .post("/api/quiz/complete")
      .set("Authorization", `Bearer ${token}`);
    expect(complete.status).toBe(200);
    expect(complete.body.correctCount).toBe(5);
    expect(complete.body.awardedLife).toBe(true);
    expect(complete.body.newLives).toBe(2);
  });
});
