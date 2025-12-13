import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - stores e-commerce product information
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  category: varchar("category", { length: 100 }),
  price: int("price").notNull(), // stored in cents
  currentStock: int("currentStock").default(0),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Sales history table - stores historical sales data for ML predictions
 */
export const salesHistory = mysqlTable("salesHistory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  quantity: int("quantity").notNull(),
  revenue: int("revenue").notNull(), // stored in cents
  saleDate: timestamp("saleDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesHistory = typeof salesHistory.$inferSelect;
export type InsertSalesHistory = typeof salesHistory.$inferInsert;

/**
 * Forecasts table - stores ML-generated demand predictions
 */
export const forecasts = mysqlTable("forecasts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  forecastDate: timestamp("forecastDate").notNull(),
  predictedQuantity: int("predictedQuantity").notNull(),
  predictedRevenue: int("predictedRevenue").notNull(), // stored in cents
  confidence: int("confidence").notNull(), // 0-100 percentage
  trend: varchar("trend", { length: 50 }), // 'increasing', 'decreasing', 'stable'
  seasonalityFactor: int("seasonalityFactor").default(100), // 100 = normal, >100 = high season
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = typeof forecasts.$inferInsert;

/**
 * Alerts table - stores demand alerts for products
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  alertType: mysqlEnum("alertType", ["high_demand", "low_demand", "stock_alert", "trend_change"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;