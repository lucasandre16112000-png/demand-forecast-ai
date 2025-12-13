import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateForecast, analyzeTrend, analyzeSeasonality, detectAnomalies } from "./mlEngine";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProductsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getProductById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        category: z.string().optional(),
        price: z.number().min(0),
        currentStock: z.number().min(0).default(0),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createProduct(ctx.user.id, input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        sku: z.string().optional(),
        category: z.string().optional(),
        price: z.number().min(0).optional(),
        currentStock: z.number().min(0).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateProduct(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProduct(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  sales: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSalesHistoryByUserId(ctx.user.id);
    }),

    byProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getSalesHistoryByProductId(input.productId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        revenue: z.number().min(0),
        saleDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSalesHistory(ctx.user.id, input);
        return { success: true };
      }),

    bulkCreate: protectedProcedure
      .input(z.object({
        sales: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          revenue: z.number().min(0),
          saleDate: z.date(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        for (const sale of input.sales) {
          await db.createSalesHistory(ctx.user.id, sale);
        }
        return { success: true, count: input.sales.length };
      }),
  }),

  forecasts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getForecastsByUserId(ctx.user.id);
    }),

    byProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getForecastsByProductId(input.productId, ctx.user.id);
      }),

    generate: protectedProcedure
      .input(z.object({
        productId: z.number(),
        daysAhead: z.number().min(1).max(90).default(30),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get sales history
        const salesHistory = await db.getSalesHistoryByProductId(input.productId, ctx.user.id);
        
        if (salesHistory.length === 0) {
          throw new Error("No sales history available for this product");
        }

        // Generate forecasts using ML engine
        const forecasts = generateForecast(salesHistory, input.daysAhead);

        // Save forecasts to database
        for (const forecast of forecasts) {
          await db.createForecast(ctx.user.id, {
            productId: input.productId,
            forecastDate: forecast.forecastDate,
            predictedQuantity: forecast.predictedQuantity,
            predictedRevenue: forecast.predictedRevenue,
            confidence: forecast.confidence,
            trend: forecast.trend,
            seasonalityFactor: forecast.seasonalityFactor,
          });
        }

        return { success: true, count: forecasts.length };
      }),

    analyze: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        const salesHistory = await db.getSalesHistoryByProductId(input.productId, ctx.user.id);
        
        if (salesHistory.length === 0) {
          return { trend: null, seasonality: null };
        }

        const trend = analyzeTrend(salesHistory);
        const seasonality = analyzeSeasonality(salesHistory);

        return { trend, seasonality };
      }),
  }),

  alerts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAlertsByUserId(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markAlertAsRead(input.id, ctx.user.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAlert(input.id, ctx.user.id);
        return { success: true };
      }),

    generate: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get product, sales history and forecasts
        const product = await db.getProductById(input.productId, ctx.user.id);
        if (!product) {
          throw new Error("Product not found");
        }

        const salesHistory = await db.getSalesHistoryByProductId(input.productId, ctx.user.id);
        const forecastsData = await db.getForecastsByProductId(input.productId, ctx.user.id);

        if (salesHistory.length === 0 || forecastsData.length === 0) {
          return { success: true, count: 0 };
        }

        // Convert forecasts to expected format
        const forecasts = forecastsData.map(f => ({
          forecastDate: f.forecastDate,
          predictedQuantity: f.predictedQuantity,
          predictedRevenue: f.predictedRevenue,
          confidence: f.confidence,
          trend: f.trend as "increasing" | "decreasing" | "stable",
          seasonalityFactor: f.seasonalityFactor || 100,
        }));

        // Detect anomalies and generate alerts
        const alerts = detectAnomalies(product, salesHistory, forecasts);

        // Save alerts to database
        for (const alert of alerts) {
          await db.createAlert(ctx.user.id, {
            productId: input.productId,
            alertType: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            isRead: 0,
          });
        }

        return { success: true, count: alerts.length };
      }),
  }),

  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const products = await db.getProductsByUserId(ctx.user.id);
      const sales = await db.getSalesHistoryByUserId(ctx.user.id);
      const forecasts = await db.getForecastsByUserId(ctx.user.id);
      const alerts = await db.getAlertsByUserId(ctx.user.id);

      // Calculate metrics
      const totalProducts = products.length;
      const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
      const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
      const unreadAlerts = alerts.filter(a => a.isRead === 0).length;

      // Calculate predicted revenue for next 30 days
      const now = new Date();
      const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const predictedRevenue = forecasts
        .filter(f => f.forecastDate >= now && f.forecastDate <= next30Days)
        .reduce((sum, f) => sum + f.predictedRevenue, 0);

      return {
        totalProducts,
        totalRevenue,
        totalSales,
        unreadAlerts,
        predictedRevenue,
        recentSales: sales.slice(0, 10),
        recentAlerts: alerts.slice(0, 5),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
