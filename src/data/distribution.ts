export type DistributionChannel = "dropshipper" | "distributor" | "retail" | "platform";

export interface ChannelPricingRule {
  channel: DistributionChannel;
  label: string;
  description: string;
  icon: string;
  // Pricing tiers (per product)
  marginPct: number; // % markup over production cost
  minPrice: number; // floor price (BDT) — prevents undercutting
  maxDiscount: number; // max discount % from retail
  commissionPct: number; // platform commission %
  color: string;
}

export interface ProductDistribution {
  productId: string;
  productName: string;
  productImage: string;
  productionCost: number;
  channels: {
    channel: DistributionChannel;
    enabled: boolean;
    price: number;
    minPrice: number;
    maxPrice: number;
    allocatedStock: number;
    soldUnits: number;
  }[];
  totalStock: number;
}

export const CHANNEL_CONFIG: Record<DistributionChannel, ChannelPricingRule> = {
  platform: {
    channel: "platform",
    label: "Direct Platform Sales",
    description: "Sold directly via the platform at full retail price. Highest margin, no intermediary.",
    icon: "🌐",
    marginPct: 100,
    minPrice: 0,
    maxDiscount: 5,
    commissionPct: 0,
    color: "bg-primary/10 text-primary",
  },
  retail: {
    channel: "retail",
    label: "Retail Shops",
    description: "Sold to retail partners at wholesale price. Fixed markup ensures no undercutting.",
    icon: "🏪",
    marginPct: 50,
    minPrice: 0,
    maxDiscount: 10,
    commissionPct: 5,
    color: "bg-accent text-accent-foreground",
  },
  distributor: {
    channel: "distributor",
    label: "Local Distributors",
    description: "Bulk pricing for distributors. Lowest per-unit cost but highest volume commitment.",
    icon: "🚛",
    marginPct: 30,
    minPrice: 0,
    maxDiscount: 20,
    commissionPct: 3,
    color: "bg-secondary text-secondary-foreground",
  },
  dropshipper: {
    channel: "dropshipper",
    label: "Sales Partners",
    description: "No-inventory model. Sales Partners promote at retail and earn the margin above wholesale price.",
    icon: "📱",
    marginPct: 40,
    minPrice: 0,
    maxDiscount: 0,
    commissionPct: 0,
    color: "bg-primary/15 text-primary",
  },
};

export const PRICING_RULES = [
  {
    id: "PR-01",
    name: "No Undercutting Rule",
    description: "No channel can sell below the Minimum Advertised Price (MAP). Platform price is always the reference ceiling.",
    severity: "critical" as const,
  },
  {
    id: "PR-02",
    name: "Channel Price Hierarchy",
    description: "Platform ≥ Retail ≥ Sales Partner > Distributor. Lower tiers must never exceed higher-tier pricing.",
    severity: "critical" as const,
  },
  {
    id: "PR-03",
    name: "Maximum Discount Cap",
    description: "Each channel has a maximum discount from retail: Platform 5%, Retail 10%, Distributor 20%, Dropshipper 0% (fixed).",
    severity: "warning" as const,
  },
  {
    id: "PR-04",
    name: "Minimum Margin Protection",
    description: "All channel prices must maintain at least 20% margin above production cost to ensure profitability.",
    severity: "critical" as const,
  },
  {
    id: "PR-05",
    name: "Stock Allocation Limits",
    description: "No single channel can be allocated more than 60% of total available stock to ensure availability across channels.",
    severity: "warning" as const,
  },
];

// Helper: compute channel prices from production cost
export function computeChannelPrices(productionCost: number, retailPrice: number) {
  const map = Math.round(productionCost * 1.2); // 20% above cost = MAP
  const platformPrice = retailPrice;
  const retailShopPrice = Math.max(Math.round(retailPrice * 0.85), map);
  const dropshipPrice = Math.max(Math.round(retailPrice * 0.65), map);
  const distributorPrice = Math.max(Math.round(retailPrice * 0.55), map);

  return {
    platform: { price: platformPrice, min: map, max: platformPrice },
    retail: { price: retailShopPrice, min: map, max: retailPrice },
    dropshipper: { price: dropshipPrice, min: map, max: retailShopPrice },
    distributor: { price: distributorPrice, min: map, max: dropshipPrice },
  };
}
