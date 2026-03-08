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
    label: "Dropshippers",
    description: "No-inventory model. Dropshippers promote at retail and earn the margin above dropship price.",
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
    description: "Platform ≥ Retail ≥ Dropship > Distributor. Lower tiers must never exceed higher-tier pricing.",
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
  const platformPrice = retailPrice;
  const retailShopPrice = Math.round(retailPrice * 0.85); // ~15% below retail
  const dropshipPrice = Math.round(retailPrice * 0.65);   // ~35% below retail
  const distributorPrice = Math.round(retailPrice * 0.55); // ~45% below retail
  const map = Math.round(productionCost * 1.2); // 20% above cost = MAP

  return {
    platform: { price: platformPrice, min: map, max: platformPrice },
    retail: { price: retailShopPrice, min: map, max: retailPrice },
    dropshipper: { price: dropshipPrice, min: map, max: retailShopPrice },
    distributor: { price: distributorPrice, min: map, max: dropshipPrice },
  };
}

export const mockDistributions: ProductDistribution[] = [
  {
    productId: "dp1", productName: "Premium Cotton T-Shirt", productImage: "👕", productionCost: 300, totalStock: 408,
    channels: [
      { channel: "platform", enabled: true, price: 650, minPrice: 360, maxPrice: 650, allocatedStock: 80, soldUnits: 22 },
      { channel: "retail", enabled: true, price: 553, minPrice: 360, maxPrice: 650, allocatedStock: 120, soldUnits: 35 },
      { channel: "dropshipper", enabled: true, price: 420, minPrice: 360, maxPrice: 553, allocatedStock: 150, soldUnits: 28 },
      { channel: "distributor", enabled: true, price: 365, minPrice: 360, maxPrice: 420, allocatedStock: 58, soldUnits: 7 },
    ],
  },
  {
    productId: "dp2", productName: "Organic Skincare Set", productImage: "🧴", productionCost: 500, totalStock: 255,
    channels: [
      { channel: "platform", enabled: true, price: 1200, minPrice: 600, maxPrice: 1200, allocatedStock: 50, soldUnits: 12 },
      { channel: "retail", enabled: true, price: 1020, minPrice: 600, maxPrice: 1200, allocatedStock: 80, soldUnits: 18 },
      { channel: "dropshipper", enabled: true, price: 750, minPrice: 600, maxPrice: 1020, allocatedStock: 100, soldUnits: 15 },
      { channel: "distributor", enabled: false, price: 660, minPrice: 600, maxPrice: 750, allocatedStock: 0, soldUnits: 0 },
    ],
  },
  {
    productId: "dp3", productName: "Bamboo Kitchen Utensils", productImage: "🥄", productionCost: 200, totalStock: 676,
    channels: [
      { channel: "platform", enabled: true, price: 520, minPrice: 240, maxPrice: 520, allocatedStock: 100, soldUnits: 30 },
      { channel: "retail", enabled: true, price: 442, minPrice: 240, maxPrice: 520, allocatedStock: 200, soldUnits: 52 },
      { channel: "dropshipper", enabled: true, price: 300, minPrice: 240, maxPrice: 442, allocatedStock: 250, soldUnits: 42 },
      { channel: "distributor", enabled: true, price: 286, minPrice: 240, maxPrice: 300, allocatedStock: 126, soldUnits: 0 },
    ],
  },
  {
    productId: "dp4", productName: "Handcrafted Leather Wallet", productImage: "👛", productionCost: 800, totalStock: 148,
    channels: [
      { channel: "platform", enabled: true, price: 1800, minPrice: 960, maxPrice: 1800, allocatedStock: 30, soldUnits: 8 },
      { channel: "retail", enabled: true, price: 1530, minPrice: 960, maxPrice: 1800, allocatedStock: 50, soldUnits: 20 },
      { channel: "dropshipper", enabled: true, price: 1100, minPrice: 960, maxPrice: 1530, allocatedStock: 48, soldUnits: 12 },
      { channel: "distributor", enabled: true, price: 990, minPrice: 960, maxPrice: 1100, allocatedStock: 20, soldUnits: 12 },
    ],
  },
  {
    productId: "dp5", productName: "Artisan Coffee Blend", productImage: "☕", productionCost: 180, totalStock: 880,
    channels: [
      { channel: "platform", enabled: true, price: 420, minPrice: 216, maxPrice: 420, allocatedStock: 150, soldUnits: 20 },
      { channel: "retail", enabled: true, price: 357, minPrice: 216, maxPrice: 420, allocatedStock: 300, soldUnits: 45 },
      { channel: "dropshipper", enabled: true, price: 250, minPrice: 216, maxPrice: 357, allocatedStock: 300, soldUnits: 35 },
      { channel: "distributor", enabled: true, price: 231, minPrice: 216, maxPrice: 250, allocatedStock: 130, soldUnits: 20 },
    ],
  },
  {
    productId: "dp6", productName: "Wireless Earbuds Pro", productImage: "🎧", productionCost: 1500, totalStock: 150,
    channels: [
      { channel: "platform", enabled: true, price: 3200, minPrice: 1800, maxPrice: 3200, allocatedStock: 40, soldUnits: 10 },
      { channel: "retail", enabled: false, price: 2720, minPrice: 1800, maxPrice: 3200, allocatedStock: 0, soldUnits: 0 },
      { channel: "dropshipper", enabled: true, price: 2100, minPrice: 1800, maxPrice: 2720, allocatedStock: 80, soldUnits: 18 },
      { channel: "distributor", enabled: true, price: 1850, minPrice: 1800, maxPrice: 2100, allocatedStock: 30, soldUnits: 4 },
    ],
  },
];
