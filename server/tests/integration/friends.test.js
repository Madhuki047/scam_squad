import request from "supertest";
import createApp from "../../app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../helpers/db.js";
import { makeUserWithToken } from "../helpers/auth.js";
import User from "../../models/User.js";

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe("friend request lifecycle", () => {
  test("send → list outgoing for sender, list incoming for recipient", async () => {
    const { user: a, token: tokenA } = await makeUserWithToken({ username: "alice" });
    const { user: b, token: tokenB } = await makeUserWithToken({ username: "bob" });

    const send = await request(app)
      .post(`/api/friends/request/${b._id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(send.status).toBe(200);
    expect(send.body.status).toBe("sent");

    const outgoing = await request(app)
      .get("/api/friends/outgoing")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(outgoing.body.items.map((i) => i.username)).toEqual(["bob"]);

    const incoming = await request(app)
      .get("/api/friends/requests")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(incoming.body.items.map((i) => i.username)).toEqual(["alice"]);
  });

  test("accept makes both sides friends, clears the pending request", async () => {
    const { user: a, token: tokenA } = await makeUserWithToken({ username: "alice2" });
    const { user: b, token: tokenB } = await makeUserWithToken({ username: "bob2" });

    await request(app)
      .post(`/api/friends/request/${b._id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const accept = await request(app)
      .post(`/api/friends/accept/${a._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(accept.status).toBe(200);

    const myFriends = await request(app)
      .get("/api/friends")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(myFriends.body.items.map((i) => i.username)).toEqual(["bob2"]);

    const theirFriends = await request(app)
      .get("/api/friends")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(theirFriends.body.items.map((i) => i.username)).toEqual(["alice2"]);

    const stillPending = await request(app)
      .get("/api/friends/requests")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(stillPending.body.items).toEqual([]);
  });

  test("decline removes the pending request and does NOT add a friend", async () => {
    const { user: a, token: tokenA } = await makeUserWithToken({ username: "alice3" });
    const { user: b, token: tokenB } = await makeUserWithToken({ username: "bob3" });

    await request(app)
      .post(`/api/friends/request/${b._id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const decline = await request(app)
      .post(`/api/friends/decline/${a._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(decline.status).toBe(200);

    const bobFresh = await User.findById(b._id);
    expect(bobFresh.pendingRequests).toHaveLength(0);
    expect(bobFresh.friends).toHaveLength(0);
  });

  test("remove unfriends both sides", async () => {
    const { user: a, token: tokenA } = await makeUserWithToken({ username: "alice4" });
    const { user: b, token: tokenB } = await makeUserWithToken({ username: "bob4" });
    await request(app)
      .post(`/api/friends/request/${b._id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    await request(app)
      .post(`/api/friends/accept/${a._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    const remove = await request(app)
      .delete(`/api/friends/${b._id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(remove.status).toBe(200);

    const aFresh = await User.findById(a._id);
    const bFresh = await User.findById(b._id);
    expect(aFresh.friends).toHaveLength(0);
    expect(bFresh.friends).toHaveLength(0);
  });

  test("cannot send a request to yourself", async () => {
    const { user, token } = await makeUserWithToken({ username: "lonely" });
    const res = await request(app)
      .post(`/api/friends/request/${user._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test("search excludes self, friends, and pending requests", async () => {
    const { token: tokenA } = await makeUserWithToken({ username: "search_me_alice" });
    await makeUserWithToken({ username: "search_target_one" });
    await makeUserWithToken({ username: "search_target_two" });

    const res = await request(app)
      .get("/api/friends/search?q=search_target")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.items.map((i) => i.username).sort()).toEqual([
      "search_target_one",
      "search_target_two",
    ]);
  });

  test("search returns empty for queries shorter than 2 chars", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .get("/api/friends/search?q=a")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.items).toEqual([]);
  });
});
