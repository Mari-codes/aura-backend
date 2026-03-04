import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../../main/app.js";
import { prisma } from "../../../shared/db/prisma.js";
import { clearDb, makeToken, uniq } from "../../../test/test-helpers.js";

describe("Orders HTTP", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/v1/orders");
    expect(res.status).toBe(401);
  });

  it("should checkout and create order from cart", async () => {
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
        priceCents: 2000,
        stock: 10,
        isActive: true,
      },
    });

    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 2,
      },
    });

    const token = makeToken(user.id);

    const checkoutRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.totalCents).toBe(4000);
    expect(checkoutRes.body.status).toBe("PENDING");

    const listRes = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);
  });

  it("should pay order", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalCents: 1000,
        status: "PENDING",
      },
    });

    const token = makeToken(user.id);

    const payRes = await request(app)
      .post(`/api/v1/orders/${order.id}/pay`)
      .set("Authorization", `Bearer ${token}`);

    expect(payRes.status).toBe(200);
    expect(payRes.body.status).toBe("PAID");
  });

  it("should cancel order", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        email: `${uniq("user")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalCents: 1000,
        status: "PENDING",
      },
    });

    const token = makeToken(user.id);

    const cancelRes = await request(app)
      .post(`/api/v1/orders/${order.id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe("CANCELED");
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
