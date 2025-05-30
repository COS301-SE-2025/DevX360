// tests/unit/users.test.js

const request = require("supertest");
const app = require("../../../api/app");
const User = require("../../../api/models/User");
const jwt = require("jsonwebtoken");

jest.mock("../../../api/models/User");
jest.mock("jsonwebtoken");

describe("GET /api/users", () => {
  const adminToken = "admin-token";
  const userToken = "user-token";

  beforeEach(() => {
    jest.clearAllMocks();

    // mock jwt.verify
    jwt.verify.mockImplementation((token, secret, cb) => {
      if (token === adminToken) {
        return cb(null, { userId: "1", role: "admin" });
      }
      if (token === userToken) {
        return cb(null, { userId: "2", role: "user" });
      }
      // invalid
      return cb(new Error("invalid token"), null);
    });
  });

  it("returns 401 if no token provided", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token required/i);
  });

  it("returns 401 if token invalid", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer some-bad-token");
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it("returns 403 if user is not admin", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Admin access required");
  });

  it("returns list of users for admin", async () => {
    // mock User.find().select('-password')
    const fakeUsers = [
      { _id: "1", name: "Alice", email: "a@x.com", role: "user" },
      { _id: "2", name: "Bob", email: "b@x.com", role: "admin" },
    ];
    const mQuery = { select: jest.fn().mockResolvedValue(fakeUsers) };
    User.find.mockReturnValue(mQuery);

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(User.find).toHaveBeenCalledWith({});
    expect(mQuery.select).toHaveBeenCalledWith("-password");

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ users: fakeUsers });
  });
});
