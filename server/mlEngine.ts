/**
 * Machine Learning Engine for Demand Forecasting
 * Author: Lucas Andre S
 * 
 * This module implements demand prediction algorithms using statistical methods
 * and time series analysis for e-commerce sales forecasting.
 */

import { SalesHistory } from "../drizzle/schema";

export interface ForecastResult {
  forecastDate: Date;
  predictedQuantity: number;
  predictedRevenue: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
  seasonalityFactor: number;
}

export interface TrendAnalysis {
  direction: "increasing" | "decreasing" | "stable";
  strength: number; // 0-100
  growthRate: number; // percentage
}

export interface SeasonalityAnalysis {
  hasSeason: boolean;
  peakPeriods: number[]; // month numbers (1-12)
  lowPeriods: number[];
  seasonalityFactor: number;
}

/**
 * Calculate moving average for smoothing
 */
function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i]);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  return result;
}

/**
 * Calculate linear regression for trend analysis
 */
function calculateLinearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Analyze trend from sales history
 */
export function analyzeTrend(salesHistory: SalesHistory[]): TrendAnalysis {
  if (salesHistory.length < 2) {
    return { direction: "stable", strength: 0, growthRate: 0 };
  }

  // Sort by date
  const sorted = [...salesHistory].sort((a, b) => 
    new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
  );

  // Extract quantities
  const quantities = sorted.map(s => s.quantity);
  const x = sorted.map((_, i) => i);

  // Calculate regression
  const { slope, intercept } = calculateLinearRegression(x, quantities);

  // Calculate average
  const avg = quantities.reduce((a, b) => a + b, 0) / quantities.length;

  // Determine trend direction and strength
  const growthRate = avg > 0 ? (slope / avg) * 100 : 0;
  const strength = Math.min(Math.abs(growthRate) * 10, 100);

  let direction: "increasing" | "decreasing" | "stable" = "stable";
  if (growthRate > 2) direction = "increasing";
  else if (growthRate < -2) direction = "decreasing";

  return { direction, strength, growthRate };
}

/**
 * Analyze seasonality patterns
 */
export function analyzeSeasonality(salesHistory: SalesHistory[]): SeasonalityAnalysis {
  if (salesHistory.length < 12) {
    return { hasSeason: false, peakPeriods: [], lowPeriods: [], seasonalityFactor: 100 };
  }

  // Group by month
  const monthlyData: { [month: number]: number[] } = {};
  
  salesHistory.forEach(sale => {
    const month = new Date(sale.saleDate).getMonth() + 1;
    if (!monthlyData[month]) monthlyData[month] = [];
    monthlyData[month].push(sale.quantity);
  });

  // Calculate average per month
  const monthlyAvg: { [month: number]: number } = {};
  Object.keys(monthlyData).forEach(month => {
    const monthNum = parseInt(month);
    const avg = monthlyData[monthNum].reduce((a, b) => a + b, 0) / monthlyData[monthNum].length;
    monthlyAvg[monthNum] = avg;
  });

  // Calculate overall average
  const overallAvg = Object.values(monthlyAvg).reduce((a, b) => a + b, 0) / Object.values(monthlyAvg).length;

  // Find peaks and lows
  const peakPeriods: number[] = [];
  const lowPeriods: number[] = [];

  Object.keys(monthlyAvg).forEach(month => {
    const monthNum = parseInt(month);
    const avg = monthlyAvg[monthNum];
    if (avg > overallAvg * 1.2) peakPeriods.push(monthNum);
    if (avg < overallAvg * 0.8) lowPeriods.push(monthNum);
  });

  const hasSeason = peakPeriods.length > 0 || lowPeriods.length > 0;
  const seasonalityFactor = hasSeason ? Math.round((Math.max(...Object.values(monthlyAvg)) / overallAvg) * 100) : 100;

  return { hasSeason, peakPeriods, lowPeriods, seasonalityFactor };
}

/**
 * Generate demand forecast for future periods
 */
export function generateForecast(
  salesHistory: SalesHistory[],
  daysAhead: number = 30
): ForecastResult[] {
  if (salesHistory.length === 0) {
    return [];
  }

  // Sort by date
  const sorted = [...salesHistory].sort((a, b) => 
    new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
  );

  // Analyze trend and seasonality
  const trend = analyzeTrend(sorted);
  const seasonality = analyzeSeasonality(sorted);

  // Calculate recent average (last 30 days or all data if less)
  const recentData = sorted.slice(-30);
  const avgQuantity = recentData.reduce((sum, s) => sum + s.quantity, 0) / recentData.length;
  const avgRevenue = recentData.reduce((sum, s) => sum + s.revenue, 0) / recentData.length;

  // Get last date
  const lastDate = new Date(sorted[sorted.length - 1].saleDate);

  // Generate forecasts
  const forecasts: ForecastResult[] = [];

  for (let i = 1; i <= daysAhead; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    // Apply trend
    let trendFactor = 1;
    if (trend.direction === "increasing") {
      trendFactor = 1 + (trend.growthRate / 100) * (i / 30);
    } else if (trend.direction === "decreasing") {
      trendFactor = 1 + (trend.growthRate / 100) * (i / 30);
    }

    // Apply seasonality
    const forecastMonth = forecastDate.getMonth() + 1;
    let seasonalFactor = seasonality.seasonalityFactor / 100;
    
    if (seasonality.peakPeriods.includes(forecastMonth)) {
      seasonalFactor *= 1.2;
    } else if (seasonality.lowPeriods.includes(forecastMonth)) {
      seasonalFactor *= 0.8;
    }

    // Calculate prediction
    const predictedQuantity = Math.round(avgQuantity * trendFactor * seasonalFactor);
    const predictedRevenue = Math.round(avgRevenue * trendFactor * seasonalFactor);

    // Calculate confidence (decreases with time)
    const baseConfidence = Math.min(sorted.length * 2, 90);
    const confidence = Math.max(baseConfidence - (i / daysAhead) * 20, 50);

    forecasts.push({
      forecastDate,
      predictedQuantity: Math.max(predictedQuantity, 0),
      predictedRevenue: Math.max(predictedRevenue, 0),
      confidence: Math.round(confidence),
      trend: trend.direction,
      seasonalityFactor: Math.round(seasonalFactor * 100),
    });
  }

  return forecasts;
}

/**
 * Detect anomalies and generate alerts
 */
export function detectAnomalies(
  product: { id: number; name: string; currentStock: number | null },
  salesHistory: SalesHistory[],
  forecasts: ForecastResult[]
): Array<{
  alertType: "high_demand" | "low_demand" | "stock_alert" | "trend_change";
  severity: "low" | "medium" | "high";
  message: string;
}> {
  const alerts: Array<{
    alertType: "high_demand" | "low_demand" | "stock_alert" | "trend_change";
    severity: "low" | "medium" | "high";
    message: string;
  }> = [];

  if (forecasts.length === 0) return alerts;

  // Calculate average predicted demand for next 7 days
  const next7Days = forecasts.slice(0, 7);
  const avgDemand = next7Days.reduce((sum, f) => sum + f.predictedQuantity, 0) / next7Days.length;

  // Check for high demand
  const highDemandThreshold = avgDemand * 1.5;
  if (next7Days.some(f => f.predictedQuantity > highDemandThreshold)) {
    alerts.push({
      alertType: "high_demand",
      severity: "high",
      message: `High demand predicted for ${product.name}. Expected ${Math.round(avgDemand)} units/day in the next week.`,
    });
  }

  // Check for low demand
  const lowDemandThreshold = avgDemand * 0.5;
  if (next7Days.every(f => f.predictedQuantity < lowDemandThreshold)) {
    alerts.push({
      alertType: "low_demand",
      severity: "medium",
      message: `Low demand predicted for ${product.name}. Consider promotional strategies.`,
    });
  }

  // Check stock levels
  const totalDemand7Days = next7Days.reduce((sum, f) => sum + f.predictedQuantity, 0);
  const currentStock = product.currentStock ?? 0;
  if (currentStock < totalDemand7Days) {
    alerts.push({
      alertType: "stock_alert",
      severity: "high",
      message: `Stock alert for ${product.name}. Current stock (${product.currentStock}) may not cover predicted demand (${totalDemand7Days} units) for next 7 days.`,
    });
  }

  // Check for trend changes
  const trend = analyzeTrend(salesHistory);
  if (trend.strength > 70) {
    alerts.push({
      alertType: "trend_change",
      severity: "medium",
      message: `Strong ${trend.direction} trend detected for ${product.name}. Growth rate: ${trend.growthRate.toFixed(1)}%.`,
    });
  }

  return alerts;
}
