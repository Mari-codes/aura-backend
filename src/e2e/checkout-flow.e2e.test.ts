import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../main/app.js";
import { prisma } from "../shared/db/prisma.js";
import { clearDb, makeToken, uniq } from "../test/test-helpers.js";

describe("E2E - Checkout Flow", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should complete full checkout flow", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: `${uniq("admin")}@test.com`,
        passwordHash: "hashed",
        role: "ADMIN",
      },
    });

    const adminToken = makeToken(admin.id);

    const productRes = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Lipstick",
        slug: uniq("lipstick"),
        priceCents: 3000,
        stock: 5,
        description: "Red lipstick",
      });

    expect(productRes.status).toBe(201);
    const product = productRes.body;

    const customer = await prisma.user.create({
      data: {
        name: "Customer",
        email: `${uniq("customer")}@test.com`,
        passwordHash: "hashed",
        role: "CUSTOMER",
      },
    });

    const customerToken = makeToken(customer.id);

    const cartRes = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId: product.id, quantity: 2 });

    expect(cartRes.status).toBe(201);

    const checkoutRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.totalCents).toBe(6000);
    expect(checkoutRes.body.status).toBe("PENDING");

    const orderId = checkoutRes.body.id;

    const payRes = await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(payRes.status).toBe(200);
    expect(payRes.body.status).toBe("PAID");

    const orderInDb = await prisma.order.findUnique({
      where: { id: orderId },
    });

    expect(orderInDb?.status).toBe("PAID");
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});