export type BatchStatus = "draft" | "funding" | "production" | "shipping" | "completed" | "cancelled";

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

export const MINIMUM_PARTICIPATION_BDT = 10000;

export function calculateUnitsFromInvestment(
  investmentAmount: number,
  costPerUnit: number
): { units: number; totalCost: number; remainder: number } {
  const units = Math.floor(investmentAmount / costPerUnit);
  const totalCost = units * costPerUnit;
  const remainder = investmentAmount - totalCost;
  return { units, totalCost, remainder };
}

export const PLATFORM_COMMISSION_RATE = 0.15;

export function calculateProfitEstimate(
  units: number,
  costPerUnit: number,
  retailPrice: number
): { investment: number; revenue: number; grossProfit: number; netProfit: number; profit: number; returnPct: number } {
  const investment = units * costPerUnit;
  const revenue = units * retailPrice;
  const grossProfit = revenue - investment;
  const netProfit = Math.round(grossProfit * (1 - PLATFORM_COMMISSION_RATE));
  const returnPct = investment > 0 ? (netProfit / investment) * 100 : 0;
  return { investment, revenue, grossProfit, netProfit, profit: netProfit, returnPct };
}
