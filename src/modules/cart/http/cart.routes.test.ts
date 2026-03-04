import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../../main/app.js";
import { prisma } from "../../../shared/db/prisma.js";
import { clearDb, makeToken, uniq } from "../../../test/test-helpers.js";

describe("Cart HTTP", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/v1/cart");
    expect(res.status).toBe(401);
  });

  it("should add item and list cart", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Product 1",
        slug: uniq("product"),
        priceCents: 1000,
        stock: 10,
        isActive: true,
      },
    });

    const token = makeToken(user.id);

    const addRes = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product.id, quantity: 2 });

    expect(addRes.status).toBe(201);
    expect(addRes.body.productId).toBe(product.id);
    expect(addRes.body.quantity).toBe(2);

    const listRes = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].productId).toBe(product.id);
  });

  it("should update item quantity", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Product 1",
        slug: uniq("product"),
        priceCents: 1000,
        stock: 10,
        isActive: true,
      },
    });

    const token = makeToken(user.id);

    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product.id, quantity: 1 });

    const updRes = await request(app)
      .patch(`/api/v1/cart/items/${product.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(updRes.status).toBe(200);
    expect(updRes.body.productId).toBe(product.id);
    expect(updRes.body.quantity).toBe(3);
  });

  it("should remove item", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Product 1",
        slug: uniq("product"),
        priceCents: 1000,
        stock: 10,
        isActive: true,
      },
    });

    const token = makeToken(user.id);

    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product.id, quantity: 1 });

    const delRes = await request(app)
      .delete(`/api/v1/cart/items/${product.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(204);

    const listRes = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(0);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});