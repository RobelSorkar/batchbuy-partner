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
