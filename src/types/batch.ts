export type ProjectStatus = "draft" | "funding" | "production" | "shipping" | "completed" | "cancelled";
/** @deprecated Use ProjectStatus */
export type BatchStatus = ProjectStatus;

export interface ProductionBatch {
  id: string;
  productName: string;
  batchName: string;
  productionCostPerUnit: number; // BDT
  wholesalePrice: number;
  retailPrice: number;
  totalQuantity: number;
  remainingUnits: number;
  fundedUnits: number;
  status: BatchStatus;
  minParticipation: number; // BDT (default 10000)
  category: string;
  description: string;
  manufacturer: string;
  warehouse: string;
  productionTimeDays: number;
  deadline: string;
  createdAt: string;
  image: string;
  partnersJoined: number;
  logisticsCostPerUnit: number; // BDT (delivery, packaging, warehouse, returns, damage)
}

export interface BatchParticipation {
  id: string;
  batchId: string;
  userId: string;
  userName: string;
  unitsOwned: number;
  totalInvested: number; // units * productionCostPerUnit
  joinedAt: string;
}

// Re-export everything from the global calculation engine so existing
// imports from "@/types/batch" keep working without changes.
export {
  MINIMUM_PARTICIPATION_BDT,
  PLATFORM_COMMISSION_RATE,
  allocateUnits as calculateUnitsFromInvestment_internal,
  calcInvestmentEstimate,
  calcPerUnitProfit,
} from "@/lib/calculations";

// Keep the legacy API surface so callers don't break.
import { allocateUnits } from "@/lib/calculations";
export function calculateUnitsFromInvestment(
  investmentAmount: number,
  costPerUnit: number
): { units: number; totalCost: number; unusedAmount: number } {
  const r = allocateUnits(investmentAmount, costPerUnit);
  return { units: r.units, totalCost: r.inventoryCost, unusedAmount: r.unusedAmount };
}

import { PLATFORM_COMMISSION_RATE as RATE } from "@/lib/calculations";
export const DEFAULT_LOGISTICS_COST_PER_UNIT = 40;

export function calculateProfitEstimate(
  units: number,
  costPerUnit: number,
  retailPrice: number,
  logisticsCostPerUnit: number = 0
): { investment: number; revenue: number; grossProfit: number; logisticsCost: number; netProfit: number; profit: number; returnPct: number } {
  const investment = units * costPerUnit;
  const revenue = units * retailPrice;
  const logisticsCost = units * logisticsCostPerUnit;
  const grossProfit = revenue - investment - logisticsCost;
  const netProfit = Math.round(grossProfit > 0 ? grossProfit * (1 - RATE) : grossProfit);
  const returnPct = investment > 0 ? (netProfit / investment) * 100 : 0;
  return { investment, revenue, grossProfit, logisticsCost, netProfit, profit: netProfit, returnPct };
}
