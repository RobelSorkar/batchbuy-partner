/**
 * Global Calculation Engine
 * 
 * ALL financial calculations for batches, investments, and profit estimates
 * MUST use these functions. No batch-specific calculation logic elsewhere.
 *
 * Rules:
 *   Units Financed        = CEIL(Investment / CostPerUnit)
 *   Inventory Cost        = Units × CostPerUnit
 *   Unused Amount         = Investment − Inventory Cost
 *   Logistics Cost        = Units × LogisticsPerUnit
 *   Marketing Cost        = 10% of Revenue (channel-specific)
 *   Total Cost            = Inventory Cost + Logistics Cost + Marketing Cost
 *   Gross Profit          = Revenue − Total Cost
 *   Commission            = 15% of gross profit (only if positive)
 *   Net Profit            = Gross Profit − Commission
 *   ROI                   = Net Profit / Inventory Cost × 100
 */

export const PLATFORM_COMMISSION_RATE = 0.15;
export const MARKETING_COST_RATE = 0.10;
export const MINIMUM_PARTICIPATION_BDT = 10_000;

// ─── Unit allocation ────────────────────────────────────────────────
export interface UnitAllocation {
  units: number;
  inventoryCost: number;
  unusedAmount: number;
}

export function allocateUnits(
  investmentAmount: number,
  costPerUnit: number
): UnitAllocation {
  const units = Math.ceil(investmentAmount / costPerUnit);
  const inventoryCost = units * costPerUnit;
  const unusedAmount = investmentAmount - inventoryCost;
  return { units, inventoryCost, unusedAmount };
}

// ─── Per-unit profit (useful for quick labels) ──────────────────────
export interface PerUnitProfit {
  wholesaleGrossPerUnit: number;
  wholesaleNetPerUnit: number;
  retailGrossPerUnit: number;
  retailNetPerUnit: number;
  retailReturnPct: number;
  wholesaleReturnPct: number;
}

export function calcPerUnitProfit(
  costPerUnit: number,
  wholesalePrice: number,
  retailPrice: number,
  logisticsPerUnit: number
): PerUnitProfit {
  const wholesaleMarketingPerUnit = Math.round(wholesalePrice * MARKETING_COST_RATE);
  const wholesaleGrossPerUnit = wholesalePrice - costPerUnit - logisticsPerUnit - wholesaleMarketingPerUnit;
  const wholesaleNetPerUnit = Math.round(
    wholesaleGrossPerUnit > 0
      ? wholesaleGrossPerUnit * (1 - PLATFORM_COMMISSION_RATE)
      : wholesaleGrossPerUnit
  );

  const retailMarketingPerUnit = Math.round(retailPrice * MARKETING_COST_RATE);
  const retailGrossPerUnit = retailPrice - costPerUnit - logisticsPerUnit - retailMarketingPerUnit;
  const retailNetPerUnit = Math.round(
    retailGrossPerUnit > 0
      ? retailGrossPerUnit * (1 - PLATFORM_COMMISSION_RATE)
      : retailGrossPerUnit
  );

  const retailReturnPct = costPerUnit > 0 ? (retailNetPerUnit / costPerUnit) * 100 : 0;
  const wholesaleReturnPct = costPerUnit > 0 ? (wholesaleNetPerUnit / costPerUnit) * 100 : 0;

  return {
    wholesaleGrossPerUnit,
    wholesaleNetPerUnit,
    retailGrossPerUnit,
    retailNetPerUnit,
    retailReturnPct,
    wholesaleReturnPct,
  };
}

// ─── Full investment estimate ───────────────────────────────────────
export interface InvestmentEstimate {
  // Allocation
  unitsFinanced: number;
  inventoryCost: number;
  unusedAmount: number;

  // Costs
  logisticsCost: number;
  marketingCost: number;
  totalCost: number;

  // Wholesale channel
  wholesaleRevenue: number;
  wholesaleMarketingCost: number;
  wholesaleGrossProfit: number;
  wholesaleCommission: number;
  wholesaleNetProfit: number;
  wholesaleROI: number;

  // Retail channel
  retailRevenue: number;
  retailMarketingCost: number;
  retailGrossProfit: number;
  retailCommission: number;
  retailNetProfit: number;
  retailROI: number;
}

export function calcInvestmentEstimate(
  investmentAmount: number,
  costPerUnit: number,
  wholesalePrice: number,
  retailPrice: number,
  logisticsPerUnit: number,
  /** Optional override: apply a sell-through rate (0–100). Default 100 (all sold). */
  sellThroughPct: number = 100
): InvestmentEstimate {
  const { units: unitsFinanced, inventoryCost, unusedAmount } = allocateUnits(
    investmentAmount,
    costPerUnit
  );

  const unitsSoldRaw = Math.round(unitsFinanced * (sellThroughPct / 100));
  const unitsSold = Math.min(unitsSoldRaw, unitsFinanced);

  const logisticsCost = unitsFinanced * logisticsPerUnit;

  // Wholesale
  const wholesaleRevenue = unitsSold * wholesalePrice;
  const wholesaleMarketingCost = Math.round(wholesaleRevenue * MARKETING_COST_RATE);
  const wholesaleBaseCost = inventoryCost + logisticsCost + wholesaleMarketingCost;
  const wholesaleGrossProfit = wholesaleRevenue - wholesaleBaseCost;
  const wholesaleCommission =
    wholesaleGrossProfit > 0
      ? Math.round(wholesaleGrossProfit * PLATFORM_COMMISSION_RATE)
      : 0;
  const wholesaleNetProfit = wholesaleGrossProfit - wholesaleCommission;
  const wholesaleROI = inventoryCost > 0 ? (wholesaleNetProfit / inventoryCost) * 100 : 0;

  // Retail
  const retailRevenue = unitsSold * retailPrice;
  const retailMarketingCost = Math.round(retailRevenue * MARKETING_COST_RATE);
  const retailBaseCost = inventoryCost + logisticsCost + retailMarketingCost;
  const retailGrossProfit = retailRevenue - retailBaseCost;
  const retailCommission =
    retailGrossProfit > 0
      ? Math.round(retailGrossProfit * PLATFORM_COMMISSION_RATE)
      : 0;
  const retailNetProfit = retailGrossProfit - retailCommission;
  const retailROI = inventoryCost > 0 ? (retailNetProfit / inventoryCost) * 100 : 0;

  const marketingCost = retailMarketingCost; // default to retail channel for summary
  const totalCost = inventoryCost + logisticsCost + marketingCost;

  return {
    unitsFinanced,
    inventoryCost,
    unusedAmount,
    logisticsCost,
    marketingCost,
    totalCost,
    wholesaleRevenue,
    wholesaleMarketingCost,
    wholesaleGrossProfit,
    wholesaleCommission,
    wholesaleNetProfit,
    wholesaleROI,
    retailRevenue,
    retailMarketingCost,
    retailGrossProfit,
    retailCommission,
    retailNetProfit,
    retailROI,
  };
}
