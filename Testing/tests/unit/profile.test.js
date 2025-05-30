const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../api/app");
const User = require("../../../api/models/User");
const { hashPassword, generateToken } = require("../../../api/utils/auth");
jest.setTimeout(30000);
let mongoServer;

describe("GET /api/profile", () => {
  let user;
  let token;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);

    const hashedPassword = await hashPassword("testpassword");
    user = await User.create({
      name: "Test User",
      email: "profile@example.com",
      password: hashedPassword,
      role: "user",
    });

    token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("returns 401 if no token is provided", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  it("returns 403 if token is invalid", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(403);
  });

  it("returns user profile if token is valid", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("profile@example.com");
    expect(res.body.user).not.toHaveProperty("password");
  });
});
