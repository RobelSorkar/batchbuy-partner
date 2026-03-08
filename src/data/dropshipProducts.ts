export interface DropshipProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  retailPrice: number;
  dropshipPrice: number;
  sellerProfit: number;
  stock: number;
  description: string;
  minOrder: number;
  rating: number;
  totalSold: number;
}

export interface DropshipOrder {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  quantity: number;
  retailPrice: number;
  dropshipPrice: number;
  commission: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export const dropshipProducts: DropshipProduct[] = [
  {
    id: "dp1",
    name: "Premium Cotton T-Shirt (White)",
    category: "Apparel",
    image: "👕",
    retailPrice: 650,
    dropshipPrice: 420,
    sellerProfit: 230,
    stock: 188,
    description: "100% organic cotton, available in S-XXL. Premium packaging included.",
    minOrder: 1,
    rating: 4.8,
    totalSold: 312,
  },
  {
    id: "dp2",
    name: "Organic Skincare Set",
    category: "Beauty",
    image: "🧴",
    retailPrice: 1200,
    dropshipPrice: 750,
    sellerProfit: 450,
    stock: 102,
    description: "Cleanser, toner, and moisturizer. Dermatologically tested, cruelty-free.",
    minOrder: 1,
    rating: 4.6,
    totalSold: 198,
  },
  {
    id: "dp3",
    name: "Bamboo Kitchen Utensils Set",
    category: "Home & Kitchen",
    image: "🥄",
    retailPrice: 520,
    dropshipPrice: 300,
    sellerProfit: 220,
    stock: 260,
    description: "Eco-friendly bamboo set: spatula, spoon, tongs, and serving fork.",
    minOrder: 1,
    rating: 4.7,
    totalSold: 540,
  },
  {
    id: "dp4",
    name: "Handcrafted Leather Wallet",
    category: "Accessories",
    image: "👛",
    retailPrice: 1800,
    dropshipPrice: 1100,
    sellerProfit: 700,
    stock: 45,
    description: "Full-grain leather with RFID protection. Hand-stitched. Brown & Black.",
    minOrder: 1,
    rating: 4.9,
    totalSold: 200,
  },
  {
    id: "dp5",
    name: "Artisan Coffee Blend (250g)",
    category: "Food & Beverage",
    image: "☕",
    retailPrice: 420,
    dropshipPrice: 250,
    sellerProfit: 170,
    stock: 880,
    description: "Single-origin specialty coffee. Medium roast, whole bean. Premium packaging.",
    minOrder: 1,
    rating: 4.5,
    totalSold: 120,
  },
  {
    id: "dp6",
    name: "Wireless Earbuds Pro",
    category: "Electronics",
    image: "🎧",
    retailPrice: 3200,
    dropshipPrice: 2100,
    sellerProfit: 1100,
    stock: 32,
    description: "ANC, 32-hour battery, IPX5 water resistant. Charging case included.",
    minOrder: 1,
    rating: 4.4,
    totalSold: 150,
  },
];

export const mockDropshipOrders: DropshipOrder[] = [
  {
    id: "DO-1001",
    productId: "dp1",
    productName: "Premium Cotton T-Shirt",
    customerName: "Rahim Ahmed",
    customerPhone: "01712345678",
    customerAddress: "Dhanmondi, Dhaka",
    quantity: 2,
    retailPrice: 650,
    dropshipPrice: 420,
    commission: 460,
    status: "delivered",
    createdAt: "2026-03-01",
  },
  {
    id: "DO-1002",
    productId: "dp2",
    productName: "Organic Skincare Set",
    customerName: "Fatima Khatun",
    customerPhone: "01898765432",
    customerAddress: "Gulshan, Dhaka",
    quantity: 1,
    retailPrice: 1200,
    dropshipPrice: 750,
    commission: 450,
    status: "shipped",
    createdAt: "2026-03-03",
  },
  {
    id: "DO-1003",
    productId: "dp3",
    productName: "Bamboo Kitchen Utensils",
    customerName: "Kamal Hossain",
    customerPhone: "01611223344",
    customerAddress: "Banani, Dhaka",
    quantity: 3,
    retailPrice: 520,
    dropshipPrice: 300,
    commission: 660,
    status: "processing",
    createdAt: "2026-03-05",
  },
  {
    id: "DO-1004",
    productId: "dp6",
    productName: "Wireless Earbuds Pro",
    customerName: "Nasrin Begum",
    customerPhone: "01555667788",
    customerAddress: "Uttara, Dhaka",
    quantity: 1,
    retailPrice: 3200,
    dropshipPrice: 2100,
    commission: 1100,
    status: "pending",
    createdAt: "2026-03-07",
  },
];
