import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  products, 
  InsertProduct,
  salesHistory,
  InsertSalesHistory,
  forecasts,
  InsertForecast,
  alerts,
  InsertAlert
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Products queries
 */
export async function createProduct(userId: number, product: Omit<InsertProduct, "userId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values({ ...product, userId });
  return result;
}

export async function getProductsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
}

export async function getProductById(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products)
    .where(eq(products.id, productId))
    .limit(1);
  
  return result.length > 0 && result[0].userId === userId ? result[0] : null;
}

export async function updateProduct(productId: number, userId: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products)
    .set(updates)
    .where(eq(products.id, productId));
}

export async function deleteProduct(productId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(eq(products.id, productId));
}

/**
 * Sales history queries
 */
export async function createSalesHistory(userId: number, sales: Omit<InsertSalesHistory, "userId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(salesHistory).values({ ...sales, userId });
  return result;
}

export async function getSalesHistoryByProductId(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(salesHistory)
    .where(eq(salesHistory.productId, productId))
    .orderBy(desc(salesHistory.saleDate));
}

export async function getSalesHistoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(salesHistory)
    .where(eq(salesHistory.userId, userId))
    .orderBy(desc(salesHistory.saleDate));
}

/**
 * Forecasts queries
 */
export async function createForecast(userId: number, forecast: Omit<InsertForecast, "userId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(forecasts).values({ ...forecast, userId });
  return result;
}

export async function getForecastsByProductId(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(forecasts)
    .where(eq(forecasts.productId, productId))
    .orderBy(desc(forecasts.forecastDate));
}

export async function getForecastsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(forecasts)
    .where(eq(forecasts.userId, userId))
    .orderBy(desc(forecasts.forecastDate));
}

/**
 * Alerts queries
 */
export async function createAlert(userId: number, alert: Omit<InsertAlert, "userId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(alerts).values({ ...alert, userId });
  return result;
}

export async function getAlertsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(alertId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alerts)
    .set({ isRead: 1 })
    .where(eq(alerts.id, alertId));
}

export async function deleteAlert(alertId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(alerts).where(eq(alerts.id, alertId));
}
