const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");

const user1 = {
  username: "user1",
  password: "password1",
};

const badUser = {
  username: "",
  password: "password1",
};

test("sanity", () => {
  expect(true).not.toBe(false);
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

describe("User Tests", () => {
  describe("[POST] /register", () => {
    test("Responds with new user", async () => {
      let res;
      res = await request(server).post("/api/auth/register").send(user1);
      expect(res.body.username).toEqual(user1.username);
    });
    test("Requires username and password", async () => {
      let res;
      res = await request(server).post("/api/auth/register").send(badUser);
      expect(res.body).toMatchObject({
        message: "username and password are required",
      });
    });
  });

  describe("[POST] /login", () => {
    test("Checks if username valid", async () => {
      let res;
      res = await request(server).post("/api/auth/login").send(user1);
      expect(res.body).toMatchObject({ message: "invalid credentials" });
    });
    test("Checks successful login", async () => {
      await request(server).post("/api/auth/register").send(user1);
      let res;
      res = await request(server).post("/api/auth/login").send(user1);
      expect(res.body.message).toEqual(`welcome, ${user1.username}`);
      expect(res.body.token).toBeTruthy();
    });
  });
});

describe("Jokes - [GET] only works with authorization", () => {
  test("[GET] /api/jokes - Fails without token", async () => {
    let res;
    res = await request(server).get("/api/jokes");
    expect(res.body).toMatchObject({ message: "token required" });
  });
  test("[GET] /api/jokes - Success with token", async () => {
    await request(server).post("/api/auth/register").send(user1);
    let loggedInUser;
    loggedInUser = await request(server).post("/api/auth/login").send(user1);
    let res;
    res = await request(server)
      .get("/api/jokes")
      .set({ Authorization: loggedInUser.body.token });
    console.log("res", res.body);
    expect(res.body).toHaveLength(3); //Three jokes
  });
});
