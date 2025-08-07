const request = require("supertest");
const app = require("../server"); // Adjust if your express app is exported differently

describe("Auth API", () => {
  it("should return 400 for missing fields on signup", async () => {
    const res = await request(app).post("/api/auth/signup").send({});
    expect(res.statusCode).toBe(400);
  });
});
