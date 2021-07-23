const request = require("supertest");
const bcrypt = require("bcryptjs");
const server = require("./server");
const db = require("../data/dbConfig");

const User = require("../api/auth/auth-model");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeAll(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

// Write your tests here
test("sanity", () => {
  expect(true).toBe(true);
});

describe("[POST] api/auth/register", () => {
  it("correctly registers new user to DB", async () => {
    const user = { username: "AgentCooper", password: "twinpeaks" };

    const response = await request(server)
      .post("/api/auth/register")
      .send(user);

    const expected = { id: 1, username: "AgentCooper" };

    expect(response.body).toMatchObject(expected);

    expect(response.status).toBe(201);
  });

  it("returns a user with bcrypted password", async () => {
    const user2 = { username: "Bob", password: "twinpeaks" };

    const response = await request(server)
      .post("/api/auth/register")
      .send(user2);

    await User.findById(response.body.id).then((newUser) => {
      expect(bcrypt.compareSync(user2.password, newUser.password)).toBeTruthy();
    });
  });
});

describe("[POST] /api/auth/login", () => {
  it("responds correctly to missing user info", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "AgentCooper" });

    expect(response.body.message).toEqual("username and password required");
  });

  it("can successfully login", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "AgentCooper", password: "twinpeaks" });

    expect(response.body.message).toEqual("welcome, AgentCooper");
  });
});

describe("[GET] /api/jokes", () => {
  it("cannot get jokes if not logged in", async () => {
    const response = await request(server).get("/api/jokes");

    expect(response.body.message).toEqual("token required");
  });

  it("successfully retrieves jokes with token", async () => {
    const login = await request(server)
      .post("/api/auth/login")
      .send({ username: "AgentCooper", password: "twinpeaks" });

    const jokes = await request(server)
      .get("/api/jokes")
      .set("Authorization", login.body.token);

    expect(jokes.body).toHaveLength(3);
  });
});
