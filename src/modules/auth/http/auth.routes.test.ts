import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../../main/app.js";
import { prisma } from "../../../shared/db/prisma.js";
import { makeToken, uniq, clearDb } from "../../../test/test-helpers.js";

describe("Auth HTTP", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return 401 on /me without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("should allow authenticated customer on /me", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const token = makeToken(user.id);

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(user.id);
  });

  it("should block non-admin on admin route", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const token = makeToken(user.id);

    const res = await request(app)
      .get("/api/v1/auth/admin-test")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("should allow admin on admin route", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Admin Test",
        email: `${uniq("admin")}@test.com`,
        passwordHash: "hashed",
        role: "ADMIN",
      },
    });

    const token = makeToken(admin.id);

    const res = await request(app)
      .get("/api/v1/auth/admin-test")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("You are an admin");
    expect(res.body.userId).toBe(admin.id);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});