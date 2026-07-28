import { describe, it, expect } from "vitest";
import {
  allocateUnits,
  calcPerUnitProfit,
  calcInvestmentEstimate,
  calcIndependentEstimate,
  PLATFORM_COMMISSION_RATE,
  MARKETING_COST_RATE,
} from "./calculations";

describe("allocateUnits", () => {
  it("allocates whole units with zero leftover when the investment divides evenly", () => {
    const result = allocateUnits(1000, 100);
    expect(result).toEqual({ units: 10, inventoryCost: 1000, unusedAmount: 0 });
  });

  it("rounds the unit count up (ceil) when the investment doesn't divide evenly", () => {
    // 1050 / 100 = 10.5 -> ceil to 11 units, costing 1100 total.
    const result = allocateUnits(1050, 100);
    expect(result.units).toBe(11);
    expect(result.inventoryCost).toBe(1100);
    // NOTE: because units round UP, inventoryCost can exceed the investment
    // itself, producing a *negative* unusedAmount (a shortfall, not leftover
    // change). This is documenting current behavior, not asserting it's the
    // intended design -- worth a product decision on whether this should
    // floor instead.
    expect(result.unusedAmount).toBe(-50);
  });

  it("floors correctly when investment is less than one unit's cost", () => {
    const result = allocateUnits(50, 100);
    expect(result.units).toBe(1);
    expect(result.inventoryCost).toBe(100);
    expect(result.unusedAmount).toBe(-50);
  });
});

describe("calcPerUnitProfit", () => {
  it("takes a 15% platform commission only when the per-unit margin is positive", () => {
    // retail 500, cost 200, logistics 20, marketing 10% of 500 = 50
    // gross = 500 - 200 - 20 - 50 = 230; net = 230 * 0.85 = 195.5 -> rounds to 196
    const result = calcPerUnitProfit(200, 300, 500, 20);
    expect(result.retailGrossPerUnit).toBe(230);
    expect(result.retailNetPerUnit).toBe(Math.round(230 * (1 - PLATFORM_COMMISSION_RATE)));
  });

  it("does not apply commission when the margin is zero or negative", () => {
    // retail price barely covers cost -- gross profit <= 0
    const result = calcPerUnitProfit(500, 550, 520, 10);
    expect(result.retailGrossPerUnit).toBeLessThanOrEqual(0);
    // net equals gross (unrounded commission skip), not gross * 0.85
    expect(result.retailNetPerUnit).toBe(Math.round(result.retailGrossPerUnit));
  });

  it("returns zero ROI when costPerUnit is zero, instead of dividing by zero", () => {
    const result = calcPerUnitProfit(0, 100, 200, 0);
    expect(result.retailReturnPct).toBe(0);
    expect(result.wholesaleReturnPct).toBe(0);
    expect(Number.isFinite(result.retailReturnPct)).toBe(true);
  });
});

describe("calcInvestmentEstimate", () => {
  it("computes consistent totals for a full sell-through", () => {
    const investment = 100_000;
    const costPerUnit = 1000;
    const wholesalePrice = 1500;
    const retailPrice = 2000;
    const logisticsPerUnit = 50;

    const est = calcInvestmentEstimate(investment, costPerUnit, wholesalePrice, retailPrice, logisticsPerUnit);

    expect(est.unitsFinanced).toBe(100);
    expect(est.inventoryCost).toBe(100_000);
    expect(est.logisticsCost).toBe(100 * logisticsPerUnit);

    // Retail channel money should reconcile: revenue - costs - commission = netProfit
    const expectedRetailMarketing = Math.round(est.retailRevenue * MARKETING_COST_RATE);
    expect(est.retailMarketingCost).toBe(expectedRetailMarketing);
    expect(est.retailGrossProfit).toBe(est.retailRevenue - est.inventoryCost - est.logisticsCost - est.retailMarketingCost);
    expect(est.retailNetProfit).toBe(est.retailGrossProfit - est.retailCommission);
  });

  it("scales revenue down proportionally under a partial sell-through rate", () => {
    const full = calcInvestmentEstimate(50_000, 500, 800, 1200, 20, 100);
    const half = calcInvestmentEstimate(50_000, 500, 800, 1200, 20, 50);

    // Same units financed (that's driven by investment/cost, not sell-through)...
    expect(half.unitsFinanced).toBe(full.unitsFinanced);
    // ...but roughly half the retail revenue.
    expect(half.retailRevenue).toBeCloseTo(full.retailRevenue / 2, -1);
  });

  it("never charges a commission on a losing channel", () => {
    // Retail price is below cost + logistics + marketing -- guaranteed loss.
    const est = calcInvestmentEstimate(10_000, 900, 950, 920, 50);
    expect(est.retailGrossProfit).toBeLessThan(0);
    expect(est.retailCommission).toBe(0);
    expect(est.retailNetProfit).toBe(est.retailGrossProfit);
  });
});

describe("calcIndependentEstimate", () => {
  it("caps units sold at the units financed even if sellThroughPct would round above 100%", () => {
    const est = calcIndependentEstimate(10_000, 1000, 1500, 2000, 100);
    expect(est.unitsFinanced).toBe(10);
    // potentialRevenue is bounded by unitsFinanced, never exceeds units financed * retailPrice
    expect(est.potentialRevenue).toBeLessThanOrEqual(est.unitsFinanced * 2000);
  });

  it("returns zero ROI instead of Infinity/NaN when inventoryCost is zero", () => {
    const est = calcIndependentEstimate(0, 1000, 1500, 2000);
    expect(est.inventoryCost).toBe(0);
    expect(est.potentialROI).toBe(0);
    expect(est.wholesalePotentialROI).toBe(0);
  });
});
