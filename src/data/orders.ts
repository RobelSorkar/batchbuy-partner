export type OrderStatus = "placed" | "confirmed" | "processing" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
export type OrderSource = "dropshipper" | "distributor" | "direct";

export interface OrderTimeline {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  retailPrice: number;
  dropshipPrice: number;
  commission: number;
  source: OrderSource;
  dropshipperName?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shippingMethod: string;
  trackingNumber?: string;
  status: OrderStatus;
  timeline: OrderTimeline[];
  createdAt: string;
}

export const ORDER_PIPELINE: { status: OrderStatus; label: string; description: string }[] = [
  { status: "placed", label: "Order Placed", description: "Customer placed the order" },
  { status: "confirmed", label: "Confirmed", description: "Order confirmed by platform" },
  { status: "processing", label: "Processing", description: "Warehouse is preparing the order" },
  { status: "packed", label: "Packed", description: "Product packed and ready to ship" },
  { status: "shipped", label: "Shipped", description: "Handed to delivery partner" },
  { status: "out_for_delivery", label: "Out for Delivery", description: "On the way to customer" },
  { status: "delivered", label: "Delivered", description: "Successfully delivered" },
];

export const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "processing",
  processing: "packed",
  packed: "shipped",
  shipped: "out_for_delivery",
  out_for_delivery: "delivered",
};

export const statusMeta: Record<OrderStatus, { color: string; label: string }> = {
  placed: { color: "bg-secondary text-secondary-foreground", label: "Placed" },
  confirmed: { color: "bg-accent text-accent-foreground", label: "Confirmed" },
  processing: { color: "bg-accent text-accent-foreground", label: "Processing" },
  packed: { color: "bg-primary/10 text-primary", label: "Packed" },
  shipped: { color: "bg-primary/15 text-primary", label: "Shipped" },
  out_for_delivery: { color: "bg-primary/20 text-primary", label: "Out for Delivery" },
  delivered: { color: "bg-primary/10 text-primary", label: "Delivered" },
  cancelled: { color: "bg-destructive/10 text-destructive", label: "Cancelled" },
};

export const mockOrders: Order[] = [
  {
    id: "ORD-3001",
    productName: "Premium Cotton T-Shirt (White)",
    productImage: "👕",
    quantity: 2,
    retailPrice: 650,
    dropshipPrice: 420,
    commission: 460,
    source: "dropshipper",
    dropshipperName: "Sakib Hasan",
    customerName: "Rahim Ahmed",
    customerPhone: "01712345678",
    customerAddress: "House 12, Road 5, Mirpur-10, Dhaka",
    shippingMethod: "Standard Delivery",
    trackingNumber: "TRK-BD-78432",
    status: "shipped",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 5, 2026 · 10:30 AM", note: "Customer ordered via dropshipper link" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 5, 2026 · 10:35 AM", note: "Auto-confirmed, stock available" },
      { status: "processing", label: "Processing", timestamp: "Mar 5, 2026 · 2:00 PM", note: "Assigned to Gazipur Central Warehouse" },
      { status: "packed", label: "Packed", timestamp: "Mar 6, 2026 · 9:15 AM", note: "2 units packed — Box #PCT-0215" },
      { status: "shipped", label: "Shipped", timestamp: "Mar 6, 2026 · 3:00 PM", note: "Handed to SteadFast Courier — TRK-BD-78432" },
    ],
    createdAt: "2026-03-05",
  },
  {
    id: "ORD-3002",
    productName: "Organic Skincare Set",
    productImage: "🧴",
    quantity: 1,
    retailPrice: 1200,
    dropshipPrice: 750,
    commission: 450,
    source: "dropshipper",
    dropshipperName: "Nadia Akter",
    customerName: "Fatima Khatun",
    customerPhone: "01898765432",
    customerAddress: "Flat 4B, Green Heights, Gulshan-2, Dhaka",
    shippingMethod: "Express Delivery",
    status: "delivered",
    trackingNumber: "TRK-BD-78301",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 2, 2026 · 8:00 AM" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 2, 2026 · 8:05 AM" },
      { status: "processing", label: "Processing", timestamp: "Mar 2, 2026 · 11:00 AM" },
      { status: "packed", label: "Packed", timestamp: "Mar 2, 2026 · 4:30 PM" },
      { status: "shipped", label: "Shipped", timestamp: "Mar 3, 2026 · 9:00 AM" },
      { status: "out_for_delivery", label: "Out for Delivery", timestamp: "Mar 3, 2026 · 2:00 PM" },
      { status: "delivered", label: "Delivered", timestamp: "Mar 3, 2026 · 5:15 PM", note: "Received by customer" },
    ],
    createdAt: "2026-03-02",
  },
  {
    id: "ORD-3003",
    productName: "Bamboo Kitchen Utensils Set",
    productImage: "🥄",
    quantity: 5,
    retailPrice: 520,
    dropshipPrice: 300,
    commission: 1100,
    source: "distributor",
    customerName: "Metro Mart BD",
    customerPhone: "01611223344",
    customerAddress: "Plot 24, Gulshan-2, Dhaka",
    shippingMethod: "Bulk Freight",
    status: "processing",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 7, 2026 · 3:00 PM", note: "Bulk order from distributor" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 7, 2026 · 3:30 PM" },
      { status: "processing", label: "Processing", timestamp: "Mar 8, 2026 · 9:00 AM", note: "Picking 5 units from Sylhet Eco Hub" },
    ],
    createdAt: "2026-03-07",
  },
  {
    id: "ORD-3004",
    productName: "Handcrafted Leather Wallet",
    productImage: "👛",
    quantity: 1,
    retailPrice: 1800,
    dropshipPrice: 1100,
    commission: 700,
    source: "dropshipper",
    dropshipperName: "Sakib Hasan",
    customerName: "Nasrin Begum",
    customerPhone: "01555667788",
    customerAddress: "Zindabazar, Sylhet",
    shippingMethod: "Standard Delivery",
    status: "placed",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 8, 2026 · 11:00 AM" },
    ],
    createdAt: "2026-03-08",
  },
  {
    id: "ORD-3005",
    productName: "Wireless Earbuds Pro",
    productImage: "🎧",
    quantity: 1,
    retailPrice: 3200,
    dropshipPrice: 2100,
    commission: 1100,
    source: "direct",
    customerName: "Jamal Uddin",
    customerPhone: "01999887766",
    customerAddress: "Station Road, Rangpur",
    shippingMethod: "Standard Delivery",
    status: "packed",
    trackingNumber: "TRK-BD-78500",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 6, 2026 · 1:00 PM" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 6, 2026 · 1:10 PM" },
      { status: "processing", label: "Processing", timestamp: "Mar 6, 2026 · 4:00 PM" },
      { status: "packed", label: "Packed", timestamp: "Mar 7, 2026 · 10:30 AM", note: "Ready for pickup by courier" },
    ],
    createdAt: "2026-03-06",
  },
  {
    id: "ORD-3006",
    productName: "Artisan Coffee Blend (250g)",
    productImage: "☕",
    quantity: 3,
    retailPrice: 420,
    dropshipPrice: 250,
    commission: 510,
    source: "dropshipper",
    dropshipperName: "Nadia Akter",
    customerName: "Kamal Hossain",
    customerPhone: "01322334455",
    customerAddress: "Shaheb Bazar, Rajshahi",
    shippingMethod: "Standard Delivery",
    status: "confirmed",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 8, 2026 · 9:00 AM" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 8, 2026 · 9:15 AM", note: "Stock verified at Rangpur Cold Storage" },
    ],
    createdAt: "2026-03-08",
  },
  {
    id: "ORD-3007",
    productName: "Premium Cotton T-Shirt (White)",
    productImage: "👕",
    quantity: 10,
    retailPrice: 650,
    dropshipPrice: 420,
    commission: 2300,
    source: "distributor",
    customerName: "Fashion Hub Ltd",
    customerPhone: "01777889900",
    customerAddress: "Town Hall Road, Comilla",
    shippingMethod: "Bulk Freight",
    status: "out_for_delivery",
    trackingNumber: "TRK-BD-78102",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 3, 2026 · 11:00 AM" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 3, 2026 · 11:30 AM" },
      { status: "processing", label: "Processing", timestamp: "Mar 3, 2026 · 3:00 PM" },
      { status: "packed", label: "Packed", timestamp: "Mar 4, 2026 · 10:00 AM" },
      { status: "shipped", label: "Shipped", timestamp: "Mar 4, 2026 · 4:00 PM" },
      { status: "out_for_delivery", label: "Out for Delivery", timestamp: "Mar 8, 2026 · 8:00 AM", note: "Bulk freight — estimated arrival today" },
    ],
    createdAt: "2026-03-03",
  },
  {
    id: "ORD-3008",
    productName: "Organic Skincare Set",
    productImage: "🧴",
    quantity: 2,
    retailPrice: 1200,
    dropshipPrice: 750,
    commission: 900,
    source: "dropshipper",
    dropshipperName: "Sakib Hasan",
    customerName: "Aisha Rahman",
    customerPhone: "01666778899",
    customerAddress: "Banani, Dhaka",
    shippingMethod: "Express Delivery",
    status: "cancelled",
    timeline: [
      { status: "placed", label: "Order Placed", timestamp: "Mar 4, 2026 · 2:00 PM" },
      { status: "confirmed", label: "Confirmed", timestamp: "Mar 4, 2026 · 2:15 PM" },
      { status: "cancelled", label: "Cancelled", timestamp: "Mar 4, 2026 · 6:00 PM", note: "Customer requested cancellation" },
    ],
    createdAt: "2026-03-04",
  },
];
