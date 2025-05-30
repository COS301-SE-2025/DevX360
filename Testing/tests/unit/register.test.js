// tests/unit/register.test.js

const request = require("supertest");
const app = require("../../../api/app");
const User = require("../../../api/models/User.js");
const authUtils = require("../../../api/utils/auth.js");

jest.mock("../../../api/models/User.js");
jest.mock("../../../api/utils/auth.js");

describe("POST /api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    authUtils.hashPassword.mockImplementation((pw) =>
      Promise.resolve("hashed-" + pw)
    );
    authUtils.generateToken.mockReturnValue("jwt-token");
  });

  it("returns 400 if missing fields", async () => {
    const res = await request(app).post("/api/register").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/);
  });

  it("returns 400 if password too short", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ name: "A", email: "a@b.com", password: "123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/);
  });

  it("returns 400 if email already exists", async () => {
    User.findOne.mockResolvedValue({ email: "a@b.com" });

    const res = await request(app)
      .post("/api/register")
      .send({ name: "X", email: "a@b.com", password: "123456" });

    expect(User.findOne).toHaveBeenCalledWith({ email: "a@b.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User with this email already exists");
  });

  it("creates user and returns token on success", async () => {
    User.findOne.mockResolvedValue(null);

    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked-user-id",
      name: "X",
      email: "new@b.com",
      role: "user",
    });

    User.mockImplementation((data) => ({ ...data, save: mockSave }));

    const res = await request(app)
      .post("/api/register")
      .send({ name: "X", email: "new@b.com", password: "abcdef" });

    expect(authUtils.hashPassword).toHaveBeenCalledWith("abcdef");
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "User registered successfully",
      token: "jwt-token",
      userId: "mocked-user-id",
      role: "user",
      user: {
        id: "mocked-user-id",
        name: "X",
        email: "new@b.com",
        role: "user",
      },
    });
    expect(mockSave).toHaveBeenCalled();
  });
});
