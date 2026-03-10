import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, Truck, ShoppingCart, Archive, CheckCircle, Clock, AlertTriangle, Search, MapPin, Eye
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { format } from "date-fns";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────
type OrderStatus = "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";

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
  const { data: inventoryData, isLoading: invLoading } = useInventory();
  const { data: ordersData, isLoading: ordLoading } = useOrders("warehouse");
  const updateStatus = useUpdateOrderStatus();

  const [orderFilter, setOrderFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOrder, setDetailOrder] = useState<any | null>(null);

  const inventory = inventoryData ?? [];
  const orders = ordersData ?? [];

  // Aggregate stats from inventory
  const totalStock = inventory.reduce((s, p) => s + (p.total_stock || 0), 0);
  const totalAllocated = inventory.reduce((s, p) => s + (p.allocated_stock || 0), 0);
  const totalSold = inventory.reduce((s, p) => s + (p.sold_units || 0), 0);
  const totalRemaining = totalStock - totalSold;
  const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "processing").length;

  const stats = [
    { label: "Total Stock", value: totalStock.toLocaleString(), icon: Package, change: `${inventory.length} products`, up: true },
    { label: "Allocated", value: totalAllocated.toLocaleString(), icon: Archive, change: totalStock > 0 ? `${((totalAllocated / totalStock) * 100).toFixed(0)}% of total` : "0%", up: true },
    { label: "Units Sold", value: totalSold.toLocaleString(), icon: ShoppingCart, change: totalStock > 0 ? `${((totalSold / totalStock) * 100).toFixed(0)}% sold` : "0%", up: true },
    { label: "Remaining", value: totalRemaining.toLocaleString(), icon: Truck, change: "In warehouses", up: false },
    { label: "Pending Orders", value: pendingOrders.toString(), icon: Clock, change: "Needs action", up: false },
    { label: "Total Orders", value: orders.length.toString(), icon: CheckCircle, change: "All time", up: true },
  ];

  // Filter orders
  const filteredOrders = orders.filter((o: any) => {
    const matchStatus = orderFilter === "all" || o.status === orderFilter;
    const matchSource = sourceFilter === "all" || o.channel === sourceFilter;
    const matchSearch = searchQuery === "" ||
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSource && matchSearch;
  });

  const advanceOrder = (orderId: string, currentStatus: string) => {
    const next = nextStatusMap[currentStatus as OrderStatus];
    if (!next) return;
    updateStatus.mutate(
      { orderId, status: next },
      {
        onSuccess: () => {
          toast.success(`Order updated to ${next}`);
          if (detailOrder?.id === orderId) {
            setDetailOrder((prev: any) => prev ? { ...prev, status: next } : null);
          }
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  if (invLoading || ordLoading) {
    return (
      <DashboardLayout role="warehouse">
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading warehouse data...</div>
      </DashboardLayout>
    );
  }

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
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total Stock</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Allocated</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Sold</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Available</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Warehouse</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No inventory records</td></tr>
                    )}
                    {inventory.map((p: any) => {
                      const available = (p.total_stock || 0) - (p.sold_units || 0);
                      const stockPct = p.total_stock > 0 ? (available / p.total_stock) * 100 : 0;
                      const isLow = stockPct < 25;
                      const batch = p.batches;
                      return (
                        <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="text-sm font-medium">{p.product_name}</div>
                            <div className="text-xs text-muted-foreground">{batch?.batch_name || "—"}</div>
                          </td>
                          <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{p.sku || "—"}</td>
                          <td className="px-5 py-4 text-sm font-semibold">{p.total_stock}</td>
                          <td className="px-5 py-4 text-sm">{p.allocated_stock}</td>
                          <td className="px-5 py-4 text-sm text-primary font-medium">{p.sold_units}</td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-semibold ${isLow ? "text-destructive" : ""}`}>{available}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.warehouse_location || "—"}
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
              {inventory.length > 0 && (
                <div className="p-5 border-t border-border/50">
                  <h3 className="text-sm font-semibold mb-3">Inventory Breakdown</h3>
                  <div className="space-y-3">
                    {inventory.map((p: any) => {
                      const available = (p.total_stock || 0) - (p.sold_units || 0) - (p.allocated_stock || 0);
                      return (
                        <div key={p.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{p.product_name}</span>
                            <span className="text-muted-foreground">{p.total_stock} total</span>
                          </div>
                          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                            <div
                              className="bg-primary/70 h-full"
                              style={{ width: `${p.total_stock > 0 ? (p.sold_units / p.total_stock) * 100 : 0}%` }}
                              title={`Sold: ${p.sold_units}`}
                            />
                            <div
                              className="bg-primary/30 h-full"
                              style={{ width: `${p.total_stock > 0 ? (p.allocated_stock / p.total_stock) * 100 : 0}%` }}
                              title={`Allocated: ${p.allocated_stock}`}
                            />
                            <div
                              className="bg-secondary h-full"
                              style={{ width: `${p.total_stock > 0 ? (Math.max(0, available) / p.total_stock) * 100 : 0}%` }}
                              title={`Available: ${Math.max(0, available)}`}
                            />
                          </div>
                          <div className="flex gap-4 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/70" /> Sold ({p.sold_units})</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/30" /> Allocated ({p.allocated_stock})</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-secondary" /> Available ({Math.max(0, available)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="dropship">Sales Partner</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
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
                        ({orders.filter((o: any) => o.status === f.value).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              <div className="divide-y divide-border/30">
                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No orders found</div>
                )}
                {filteredOrders.map((order: any) => {
                  const status = (order.status || "pending") as OrderStatus;
                  const StatusIcon = statusIcons[status] || Clock;
                  const canAdvance = nextStatusMap[status] !== undefined;
                  const itemsSummary = order.order_items?.map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ") || "—";
                  return (
                    <div key={order.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusColors[status] || ""}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">{order.order_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[status] || ""} capitalize`}>
                              {status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                              {order.channel}
                            </span>
                          </div>
                          <div className="text-sm mt-1">{itemsSummary}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            <span>{order.customer_name}</span>
                            {order.customer_address && (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.customer_address}</span>
                            )}
                            <span>{format(new Date(order.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setDetailOrder(order)}>
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                        {canAdvance && (
                          <Button size="sm" className="text-xs" onClick={() => advanceOrder(order.id, status)} disabled={updateStatus.isPending}>
                            {nextStatusLabel[status]}
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
            <DialogDescription>{detailOrder?.order_number}</DialogDescription>
          </DialogHeader>
          {detailOrder && (() => {
            const status = (detailOrder.status || "pending") as OrderStatus;
            return (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="text-sm font-semibold capitalize mt-0.5">{status}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Channel</div>
                    <div className="text-sm font-semibold capitalize mt-0.5">{detailOrder.channel}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {detailOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">৳{Number(item.total_price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/50 pt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">৳{Number(detailOrder.total_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyer</span>
                    <span className="font-medium">{detailOrder.customer_name}</span>
                  </div>
                  {detailOrder.customer_address && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Destination</span>
                      <span className="font-medium">{detailOrder.customer_address}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{format(new Date(detailOrder.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>

                {/* Fulfillment pipeline */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs font-medium mb-3">Fulfillment Pipeline</p>
                  <div className="flex items-center justify-between">
                    {(["pending", "processing", "packed", "shipped", "delivered"] as OrderStatus[]).map((step, i, arr) => {
                      const isActive = step === status;
                      const isPast = arr.indexOf(status) > i;
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

                {nextStatusMap[status] && (
                  <Button
                    className="w-full"
                    disabled={updateStatus.isPending}
                    onClick={() => advanceOrder(detailOrder.id, status)}
                  >
                    {nextStatusLabel[status]}
                  </Button>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WarehousePage;
