import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Products Router", () => {
  it("should create a product", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      sku: "TEST-001",
      category: "Electronics",
      price: 9999,
      currentStock: 100,
      description: "A test product",
    });

    expect(result).toEqual({ success: true });
  });

  it("should list products", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(Array.isArray(products)).toBe(true);
  });
});

describe("Sales Router", () => {
  it("should create sales history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a product
    await caller.products.create({
      name: "Test Product for Sales",
      price: 5000,
      currentStock: 50,
    });

    const products = await caller.products.list();
    const productId = products[0]?.id;

    if (productId) {
      const result = await caller.sales.create({
        productId,
        quantity: 10,
        revenue: 50000,
        saleDate: new Date(),
      });

      expect(result).toEqual({ success: true });
    }
  });
});

describe("Dashboard Router", () => {
  it("should return overview data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const overview = await caller.dashboard.overview();

    expect(overview).toHaveProperty("totalProducts");
    expect(overview).toHaveProperty("totalRevenue");
    expect(overview).toHaveProperty("totalSales");
    expect(overview).toHaveProperty("unreadAlerts");
    expect(overview).toHaveProperty("predictedRevenue");
    expect(Array.isArray(overview.recentSales)).toBe(true);
    expect(Array.isArray(overview.recentAlerts)).toBe(true);
  });
});
