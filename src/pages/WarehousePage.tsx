import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, Truck, ShoppingCart, Archive, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, AlertTriangle, Search, Filter, MapPin, Eye
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type OrderStatus = "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";
type OrderSource = "dropshipper" | "distributor";

interface WarehouseProduct {
  id: string;
  productName: string;
  batchName: string;
  totalProduced: number;
  partnerOwned: number;
  platformInventory: number;
  sold: number;
  remaining: number;
  warehouse: string;
  sku: string;
}

interface FulfillmentOrder {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  source: OrderSource;
  buyerName: string;
  destination: string;
  status: OrderStatus;
  createdAt: string;
  shippingMethod: string;
}

// ── Data ───────────────────────────────────────────────
const warehouseProducts: WarehouseProduct[] = [
  { id: "1", productName: "Premium Cotton T-Shirt", batchName: "Batch #47", totalProduced: 500, partnerOwned: 312, platformInventory: 100, sold: 92, remaining: 408, warehouse: "Gazipur Central", sku: "PCT-47-001" },
  { id: "2", productName: "Organic Skincare Set", batchName: "Batch #23", totalProduced: 300, partnerOwned: 198, platformInventory: 72, sold: 45, remaining: 255, warehouse: "Chattogram Hub", sku: "OSS-23-001" },
  { id: "3", productName: "Handcrafted Leather Wallet", batchName: "Batch #15", totalProduced: 200, partnerOwned: 120, platformInventory: 80, sold: 52, remaining: 148, warehouse: "Dhaka Central", sku: "HLW-15-001" },
  { id: "4", productName: "Bamboo Kitchen Utensils", batchName: "Batch #31", totalProduced: 800, partnerOwned: 540, platformInventory: 180, sold: 124, remaining: 676, warehouse: "Sylhet Eco Hub", sku: "BKU-31-001" },
  { id: "5", productName: "Wireless Earbuds Pro", batchName: "Batch #8", totalProduced: 150, partnerOwned: 100, platformInventory: 50, sold: 0, remaining: 150, warehouse: "Dhaka Tech WH", sku: "WEP-08-001" },
  { id: "6", productName: "Artisan Coffee Blend", batchName: "Batch #52", totalProduced: 1000, partnerOwned: 120, platformInventory: 0, sold: 0, remaining: 120, warehouse: "Rangpur Cold", sku: "ACB-52-001" },
];

const fulfillmentOrders: FulfillmentOrder[] = [
  { id: "1", orderId: "ORD-2847", productName: "Premium Cotton T-Shirt", quantity: 2, source: "dropshipper", buyerName: "Rahim Ahmed", destination: "Dhaka, Mirpur-10", status: "pending", createdAt: "Mar 8, 2026", shippingMethod: "Standard" },
  { id: "2", orderId: "ORD-2846", productName: "Organic Skincare Set", quantity: 1, source: "dropshipper", buyerName: "Fatima Khatun", destination: "Chittagong, Agrabad", status: "processing", createdAt: "Mar 7, 2026", shippingMethod: "Express" },
  { id: "3", orderId: "ORD-2845", productName: "Bamboo Kitchen Utensils", quantity: 5, source: "distributor", buyerName: "Metro Mart BD", destination: "Dhaka, Gulshan-2", status: "packed", createdAt: "Mar 7, 2026", shippingMethod: "Bulk Freight" },
  { id: "4", orderId: "ORD-2844", productName: "Handcrafted Leather Wallet", quantity: 1, source: "dropshipper", buyerName: "Nasrin Begum", destination: "Sylhet, Zindabazar", status: "shipped", createdAt: "Mar 6, 2026", shippingMethod: "Standard" },
  { id: "5", orderId: "ORD-2843", productName: "Premium Cotton T-Shirt", quantity: 10, source: "distributor", buyerName: "Fashion Hub Ltd", destination: "Comilla, Town Hall", status: "delivered", createdAt: "Mar 5, 2026", shippingMethod: "Bulk Freight" },
  { id: "6", orderId: "ORD-2842", productName: "Organic Skincare Set", quantity: 3, source: "dropshipper", buyerName: "Kamal Hossain", destination: "Rajshahi, Shaheb Bazar", status: "pending", createdAt: "Mar 8, 2026", shippingMethod: "Standard" },
  { id: "7", orderId: "ORD-2841", productName: "Bamboo Kitchen Utensils", quantity: 20, source: "distributor", buyerName: "HomeGoods Wholesale", destination: "Khulna, KDA Ave", status: "processing", createdAt: "Mar 7, 2026", shippingMethod: "Bulk Freight" },
  { id: "8", orderId: "ORD-2840", productName: "Premium Cotton T-Shirt", quantity: 1, source: "dropshipper", buyerName: "Jamal Uddin", destination: "Rangpur, Station Rd", status: "cancelled", createdAt: "Mar 4, 2026", shippingMethod: "Standard" },
];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  processing: "bg-secondary text-secondary-foreground",
  packed: "bg-primary/10 text-primary",
  shipped: "bg-primary/15 text-primary",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusIcons: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  processing: Package,
  packed: Archive,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertTriangle,
};

const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  processing: "packed",
  packed: "shipped",
  shipped: "delivered",
};

const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
  pending: "Start Processing",
  processing: "Mark as Packed",
  packed: "Ship Order",
  shipped: "Mark Delivered",
};

// ── Component ──────────────────────────────────────────
const WarehousePage = () => {
  const [orders, setOrders] = useState(fulfillmentOrders);
  const [orderFilter, setOrderFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOrder, setDetailOrder] = useState<FulfillmentOrder | null>(null);

  // Aggregate stats
  const totalProduced = warehouseProducts.reduce((s, p) => s + p.totalProduced, 0);
  const totalPartnerOwned = warehouseProducts.reduce((s, p) => s + p.partnerOwned, 0);
  const totalPlatformInv = warehouseProducts.reduce((s, p) => s + p.platformInventory, 0);
  const totalSold = warehouseProducts.reduce((s, p) => s + p.sold, 0);
  const totalRemaining = warehouseProducts.reduce((s, p) => s + p.remaining, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  const stats = [
    { label: "Total Produced", value: totalProduced.toLocaleString(), icon: Package, change: `${warehouseProducts.length} products`, up: true },
    { label: "Partner Owned", value: totalPartnerOwned.toLocaleString(), icon: Archive, change: `${((totalPartnerOwned / totalProduced) * 100).toFixed(0)}% of total`, up: true },
    { label: "Platform Inventory", value: totalPlatformInv.toLocaleString(), icon: ShoppingCart, change: "Listed for sale", up: true },
    { label: "Units Sold", value: totalSold.toLocaleString(), icon: Truck, change: `${((totalSold / totalProduced) * 100).toFixed(0)}% sold`, up: true },
    { label: "Remaining Stock", value: totalRemaining.toLocaleString(), icon: Package, change: "In warehouses", up: false },
    { label: "Pending Orders", value: pendingOrders.toString(), icon: Clock, change: "Needs action", up: false },
  ];

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderFilter === "all" || o.status === orderFilter;
    const matchSource = sourceFilter === "all" || o.source === sourceFilter;
    const matchSearch = searchQuery === "" ||
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSource && matchSearch;
  });

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = nextStatusMap[o.status];
        return next ? { ...o, status: next } : o;
      })
    );
  };

  return (
    <DashboardLayout role="warehouse">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Warehouse Inventory Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track inventory, manage stock, and fulfill orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
                <stat.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="text-xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              <div className={`text-[10px] font-medium mt-1 ${stat.up ? "text-primary" : "text-muted-foreground"}`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs: Inventory & Orders */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Product Inventory</TabsTrigger>
            <TabsTrigger value="orders">Order Fulfillment ({pendingOrders} pending)</TabsTrigger>
          </TabsList>

          {/* ── Inventory Tab ── */}
          <TabsContent value="inventory">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Warehouse Stock by Product</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product / Batch</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">SKU</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Produced</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Partner Owned</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Platform</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Sold</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Remaining</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Warehouse</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseProducts.map((p) => {
                      const stockPct = (p.remaining / p.totalProduced) * 100;
                      const isLow = stockPct < 25;
                      return (
                        <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="text-sm font-medium">{p.productName}</div>
                            <div className="text-xs text-muted-foreground">{p.batchName}</div>
                          </td>
                          <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{p.sku}</td>
                          <td className="px-5 py-4 text-sm font-semibold">{p.totalProduced}</td>
                          <td className="px-5 py-4 text-sm">{p.partnerOwned}</td>
                          <td className="px-5 py-4 text-sm">{p.platformInventory}</td>
                          <td className="px-5 py-4 text-sm text-primary font-medium">{p.sold}</td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-semibold ${isLow ? "text-destructive" : ""}`}>
                              {p.remaining}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.warehouse}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="w-20">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isLow ? "bg-destructive" : "bg-primary"}`}
                                  style={{ width: `${stockPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{stockPct.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Inventory breakdown visual */}
              <div className="p-5 border-t border-border/50">
                <h3 className="text-sm font-semibold mb-3">Inventory Breakdown</h3>
                <div className="space-y-3">
                  {warehouseProducts.map((p) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{p.productName}</span>
                        <span className="text-muted-foreground">{p.totalProduced} total</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="bg-primary/70 h-full"
                          style={{ width: `${(p.sold / p.totalProduced) * 100}%` }}
                          title={`Sold: ${p.sold}`}
                        />
                        <div
                          className="bg-primary/30 h-full"
                          style={{ width: `${(p.platformInventory / p.totalProduced) * 100}%` }}
                          title={`Platform: ${p.platformInventory}`}
                        />
                        <div
                          className="bg-secondary h-full"
                          style={{ width: `${(p.partnerOwned / p.totalProduced) * 100}%` }}
                          title={`Partner: ${p.partnerOwned}`}
                        />
                      </div>
                      <div className="flex gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/70" /> Sold ({p.sold})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/30" /> Platform ({p.platformInventory})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-secondary" /> Partner ({p.partnerOwned})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Orders Tab ── */}
          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-border/50 gap-3">
                <h2 className="font-display font-semibold text-lg">Order Fulfillment Queue</h2>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-8 h-8 text-xs w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="dropshipper">Dropshipper</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-2 p-4 border-b border-border/30 flex-wrap">
                {[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Processing", value: "processing" },
                  { label: "Packed", value: "packed" },
                  { label: "Shipped", value: "shipped" },
                  { label: "Delivered", value: "delivered" },
                ].map((f) => (
                  <Button
                    key={f.value}
                    variant={orderFilter === f.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => setOrderFilter(f.value)}
                  >
                    {f.label}
                    {f.value !== "all" && (
                      <span className="ml-1 text-[10px] opacity-70">
                        ({orders.filter((o) => o.status === f.value).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              <div className="divide-y divide-border/30">
                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No orders found</div>
                )}
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  const canAdvance = nextStatusMap[order.status] !== undefined;
                  return (
                    <div key={order.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusColors[order.status]}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">{order.orderId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status]} capitalize`}>
                              {order.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              order.source === "distributor" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                            } capitalize`}>
                              {order.source}
                            </span>
                          </div>
                          <div className="text-sm mt-1">{order.productName} × {order.quantity}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            <span>{order.buyerName}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.destination}</span>
                            <span>{order.shippingMethod}</span>
                            <span>{order.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setDetailOrder(order)}>
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                        {canAdvance && (
                          <Button size="sm" className="text-xs" onClick={() => advanceOrder(order.id)}>
                            {nextStatusLabel[order.status]}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Order Details</DialogTitle>
            <DialogDescription>{detailOrder?.orderId}</DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className={`text-sm font-semibold capitalize mt-0.5`}>{detailOrder.status}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Source</div>
                  <div className="text-sm font-semibold capitalize mt-0.5">{detailOrder.source}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium">{detailOrder.productName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{detailOrder.quantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Buyer</span>
                  <span className="font-medium">{detailOrder.buyerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium">{detailOrder.destination}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{detailOrder.shippingMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{detailOrder.createdAt}</span>
                </div>
              </div>

              {/* Fulfillment pipeline */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs font-medium mb-3">Fulfillment Pipeline</p>
                <div className="flex items-center justify-between">
                  {(["pending", "processing", "packed", "shipped", "delivered"] as OrderStatus[]).map((step, i, arr) => {
                    const isActive = step === detailOrder.status;
                    const isPast = arr.indexOf(detailOrder.status) > i;
                    const StepIcon = statusIcons[step];
                    return (
                      <div key={step} className="flex items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${
                          isPast ? "bg-primary text-primary-foreground" :
                          isActive ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          <StepIcon className="w-3.5 h-3.5" />
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`w-6 h-0.5 ${isPast ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {["Pending", "Process", "Packed", "Shipped", "Done"].map((l) => (
                    <span key={l} className="text-[9px] text-muted-foreground">{l}</span>
                  ))}
                </div>
              </div>

              {nextStatusMap[detailOrder.status] && (
                <Button
                  className="w-full"
                  onClick={() => {
                    advanceOrder(detailOrder.id);
                    setDetailOrder((prev) => prev ? { ...prev, status: nextStatusMap[prev.status]! } : null);
                  }}
                >
                  {nextStatusLabel[detailOrder.status]}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WarehousePage;
