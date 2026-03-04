import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../../main/app.js";
import { prisma } from "../../../shared/db/prisma.js";
import { clearDb, makeToken, uniq } from "../../../test/test-helpers.js";

describe("Products HTTP", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should list products (public)", async () => {
    await prisma.product.create({
      data: {
        name: "Product 1",
        slug: uniq("product"),
        priceCents: 1000,
        stock: 10,
        isActive: true,
      },
    });

    const res = await request(app).get("/api/v1/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it("should block create without token", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .send({
        name: "X",
        slug: uniq("product"),
        priceCents: 1000,
        stock: 10,
      });

    expect(res.status).toBe(401);
  });

  it("should block create for non-admin", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const token = makeToken(user.id);

    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "X",
        slug: uniq("product"),
        priceCents: 1000,
        stock: 10,
      });

    expect(res.status).toBe(403);
  });

  it("should allow admin to create product", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: `${uniq("admin")}@test.com`,
        passwordHash: "hashed",
        role: "ADMIN",
      },
    });

    const token = makeToken(admin.id);

    const payload = {
      name: "Product Admin",
      slug: uniq("product"),
      priceCents: 2500,
      stock: 5,
      isActive: true,
      description: "desc",
      imageUrl: "https://example.com/p.png",
    };

    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(payload.name);
    expect(res.body.slug).toBe(payload.slug);
    expect(res.body.priceCents).toBe(payload.priceCents);
    expect(res.body.stock).toBe(payload.stock);
    expect(res.body.isActive).toBe(payload.isActive);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
