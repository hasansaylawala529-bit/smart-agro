import { describe, it, expect } from "vitest";
import {
  cropEconomicsDataset,
  getCropEconomics,
  calculateCropFinancials,
  calculatePriceSensitivity,
} from "@/data/cropEconomics";

describe("Crop Economics Dataset", () => {
  it("should contain all 16 Maharashtra crops", () => {
    expect(cropEconomicsDataset.length).toBe(16);
  });

  it("should have realistic positive economic benchmarks for each crop", () => {
    cropEconomicsDataset.forEach((crop) => {
      expect(crop.id).toBeTruthy();
      expect(crop.name).toBeTruthy();
      expect(crop.benchmarkYield).toBeGreaterThan(0);
      expect(crop.benchmarkPrice).toBeGreaterThan(0);
      expect(crop.defaultCosts.seeds).toBeGreaterThan(0);
      expect(crop.defaultCosts.fertilizer).toBeGreaterThan(0);
      expect(crop.defaultCosts.laborAndMachinery).toBeGreaterThan(0);
      expect(["qtl", "ton"]).toContain(crop.unit);
      expect(["Kharif", "Rabi", "Zaid", "Annual"]).toContain(crop.season);
    });
  });

  it("should return correct crop by ID and fallback gracefully", () => {
    const soybean = getCropEconomics("soybean");
    expect(soybean.id).toBe("soybean");
    expect(soybean.name).toBe("Soybean");

    const fallback = getCropEconomics("non-existent-crop-xyz");
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe("soybean");
  });
});

describe("Farm Financials Calculation Engine", () => {
  it("should calculate correct baseline financials for Soybean on 2.5 acres", () => {
    const result = calculateCropFinancials({
      cropId: "soybean",
      farmAcres: 2.5,
    });

    // Soybean: benchmarkYield = 20 qtl/ac, price = 4892
    // totalYield = 20 * 2.5 = 50 qtl
    // grossRevenue = 50 * 4892 = 244,600
    expect(result.farmAcres).toBe(2.5);
    expect(result.totalYield).toBe(50);
    expect(result.grossRevenue).toBe(244600);

    // Total cost per acre = 2600 + 3400 + 2400 + 1500 + 6800 = 16,700
    // totalOperatingCost = 16700 * 2.5 = 41,750
    expect(result.totalCostPerAcre).toBe(16700);
    expect(result.totalOperatingCost).toBe(41750);

    // Net profit = 244,600 - 41,750 = 202,850
    expect(result.netProfit).toBe(202850);
    expect(result.profitPerAcre).toBe(Math.round(202850 / 2.5));
    expect(result.isProfitable).toBe(true);

    // ROI = (202850 / 41750) * 100 = 485.9%
    expect(result.roiPercentage).toBeGreaterThan(100);
    expect(result.benefitCostRatio).toBeGreaterThan(1);

    // Breakeven metrics
    // Breakeven price = 41,750 / 50 = 835 ₹/qtl
    expect(result.breakevenPricePerUnit).toBe(835);
    expect(result.breakevenYieldPerAcre).toBeLessThan(result.yieldPerAcre);
  });

  it("should dynamically recalculate with custom yield and market price", () => {
    const result = calculateCropFinancials({
      cropId: "cotton",
      farmAcres: 5,
      customYield: 15, // High yield scenario
      customPrice: 7500, // Strong market price
    });

    expect(result.totalYield).toBe(75); // 15 * 5
    expect(result.grossRevenue).toBe(75 * 7500);
    expect(result.isProfitable).toBe(true);
  });

  it("should accurately reflect loss when costs exceed revenue", () => {
    const result = calculateCropFinancials({
      cropId: "soybean",
      farmAcres: 1,
      customYield: 2, // Severe crop failure (drought)
      customPrice: 3000,
    });

    // Revenue: 2 * 3000 = 6,000, Cost: 16,700
    expect(result.grossRevenue).toBe(6000);
    expect(result.netProfit).toBeLessThan(0);
    expect(result.isProfitable).toBe(false);
    expect(result.roiPercentage).toBeLessThan(0);
  });

  it("should generate 5 price sensitivity scenarios", () => {
    const baseline = calculateCropFinancials({
      cropId: "wheat",
      farmAcres: 2,
    });

    const sensitivity = calculatePriceSensitivity(baseline);
    expect(sensitivity.length).toBe(5);

    // Bearish (-20%) should have lower profit than Bullish (+20%)
    const bearish = sensitivity[0];
    const bullish = sensitivity[4];
    expect(bearish.pricePerUnit).toBeLessThan(bullish.pricePerUnit);
    expect(bearish.netProfit).toBeLessThan(bullish.netProfit);
  });
});
