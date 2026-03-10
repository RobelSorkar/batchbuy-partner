import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Package, Truck, ShoppingCart, CheckCircle, Clock,
  Search, Eye, ArrowRight, MapPin, User, Hash, ChevronRight,
  XCircle, Box, PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ORDER_PIPELINE, OrderStatus, nextStatusMap, statusMeta } from "@/data/orders";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusIcons: Record<OrderStatus, typeof Clock> = {
  placed: ShoppingCart,
  confirmed: CheckCircle,
  processing: Package,
  packed: Box,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
};

const sourceLabels: Record<string, string> = {
  dropshipper: "Sales Partner",
  dropship: "Sales Partner",
  distributor: "Distributor",
  distribution: "Distribution",
  direct: "Direct",
};

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

interface OrderManagementProps {
  role?: "admin" | "warehouse" | "dropshipper";
}

// Map DB status to pipeline status for display
const mapStatus = (s: string): OrderStatus => {
  const map: Record<string, OrderStatus> = {
    pending: "placed",
    confirmed: "confirmed",
    processing: "processing",
    packed: "packed",
    shipped: "shipped",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return map[s] || "placed";
};

// Map pipeline status back to DB status
const mapToDbStatus = (s: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    placed: "pending",
    confirmed: "confirmed",
    processing: "processing",
    packed: "packed",
    shipped: "shipped",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return map[s] || s;
};

const nextLabel: Partial<Record<OrderStatus, string>> = {
  placed: "Confirm Order",
  confirmed: "Start Processing",
  processing: "Mark Packed",
  packed: "Ship Order",
  shipped: "Out for Delivery",
  out_for_delivery: "Mark Delivered",
};

const OrderManagement = ({ role = "admin" }: OrderManagementProps) => {
  const { data: ordersData, isLoading } = useOrders(role);
  const updateStatus = useUpdateOrderStatus();
  const [filter, setFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const { toast } = useToast();

  const orders = ordersData ?? [];

  const filtered = orders.filter((o: any) => {
    const displayStatus = mapStatus(o.status);
    const matchStatus = filter === "all" || displayStatus === filter || o.status === filter;
    const matchSource = sourceFilter === "all" || o.channel === sourceFilter;
    const matchSearch =
      search === "" ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSource && matchSearch;
  });

  // Stats
  const totalOrders = orders.length;
  const pendingAction = orders.filter((o: any) => ["pending", "confirmed", "processing", "packed"].includes(o.status)).length;
  const inTransit = orders.filter((o: any) => ["shipped", "out_for_delivery"].includes(o.status)).length;
  const completed = orders.filter((o: any) => o.status === "delivered").length;
  const cancelled = orders.filter((o: any) => o.status === "cancelled").length;
  const totalRevenue = orders.filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart },
    { label: "Pending Action", value: pendingAction, icon: Clock },
    { label: "In Transit", value: inTransit, icon: Truck },
    { label: "Delivered", value: completed, icon: CheckCircle },
    { label: "Cancelled", value: cancelled, icon: XCircle },
  ];

  const advanceOrder = (orderId: string, currentDbStatus: string) => {
    const displayStatus = mapStatus(currentDbStatus);
    const nextDisplay = nextStatusMap[displayStatus];
    if (!nextDisplay) return;
    const nextDb = mapToDbStatus(nextDisplay);

    updateStatus.mutate(
      { orderId, status: nextDb },
      {
        onSuccess: () => {
          toast({ title: "Order Updated", description: `Order → ${statusMeta[nextDisplay]?.label || nextDb}` });
          if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev: any) => prev ? { ...prev, status: nextDb } : null);
          }
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  };

  const cancelOrder = (orderId: string) => {
    updateStatus.mutate(
      { orderId, status: "cancelled" },
      {
        onSuccess: () => {
          toast({ title: "Order Cancelled", variant: "destructive" });
          if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev: any) => prev ? { ...prev, status: "cancelled" } : null);
          }
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  };

  const canAdvance = (dbStatus: string) => {
    const ds = mapStatus(dbStatus);
    return !!nextStatusMap[ds];
  };
  const canCancel = (dbStatus: string) => !["shipped", "out_for_delivery", "delivered", "cancelled"].includes(dbStatus);

  if (isLoading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading orders...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Order Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track orders from placement to delivery</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
                <stat.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="text-xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total Order Value (excl. cancelled)</div>
            <div className="text-2xl font-display font-bold text-primary">৳{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            {completed} delivered · {inTransit} in transit
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by order ID, customer..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["all", "dropship", "distribution", "direct"].map((s) => (
              <Button key={s} variant={sourceFilter === s ? "default" : "outline"} size="sm" onClick={() => setSourceFilter(s)} className="capitalize">
                {s === "all" ? "All Sources" : sourceLabels[s] || s}
              </Button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((f) => {
            const count = f.value === "all"
              ? orders.length
              : orders.filter((o: any) => mapStatus(o.status) === f.value || o.status === f.value).length;
            return (
              <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm" onClick={() => setFilter(f.value)}>
                {f.label} <span className="ml-1 text-xs opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filtered.map((order: any) => {
            const displayStatus = mapStatus(order.status);
            const meta = statusMeta[displayStatus] || statusMeta.placed;
            const StatusIcon = statusIcons[displayStatus] || Clock;
            const itemsSummary = order.order_items?.map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ") || "—";

            return (
              <div
                key={order.id}
                className="bg-card rounded-xl shadow-card border border-border/50 p-5 hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-sm">{order.order_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                          {sourceLabels[order.channel] || order.channel}
                        </span>
                      </div>
                      <div className="text-sm mt-0.5">{itemsSummary}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.customer_name}</span>
                        {order.customer_address && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.customer_address.split(",").slice(-1)[0]?.trim()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold">৳{Number(order.total_amount).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Mini pipeline */}
                <div className="mt-4 flex items-center gap-1">
                  {ORDER_PIPELINE.map((step, i) => {
                    const stepIndex = ORDER_PIPELINE.findIndex((p) => p.status === displayStatus);
                    const reached = i <= stepIndex;
                    const isCancelled = order.status === "cancelled";
                    return (
                      <div key={step.status} className="flex items-center gap-1 flex-1">
                        <div className={`h-1.5 rounded-full flex-1 ${isCancelled ? "bg-destructive/20" : reached ? "bg-primary" : "bg-muted"}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No orders match your criteria.</div>
          )}
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            {selectedOrder && (() => {
              const displayStatus = mapStatus(selectedOrder.status);
              const meta = statusMeta[displayStatus] || statusMeta.placed;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedOrder.order_number}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                    </DialogTitle>
                    <DialogDescription>
                      {selectedOrder.order_items?.map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ") || "Order details"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Customer</div>
                        <div className="text-sm font-medium mt-1">{selectedOrder.customer_name}</div>
                        {selectedOrder.customer_phone && (
                          <div className="text-xs text-muted-foreground">{selectedOrder.customer_phone}</div>
                        )}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Delivery</div>
                        <div className="text-xs font-medium mt-1">{selectedOrder.customer_address || "—"}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Channel</div>
                        <div className="text-sm font-medium mt-1 capitalize">{sourceLabels[selectedOrder.channel] || selectedOrder.channel}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Created</div>
                        <div className="text-sm font-medium mt-1">{format(new Date(selectedOrder.created_at), "MMM d, yyyy")}</div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                      {selectedOrder.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span className="font-semibold">৳{Number(item.total_price).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">৳{Number(selectedOrder.total_amount).toLocaleString()}</span>
                      </div>
                      {selectedOrder.commission > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-primary font-medium">Commission</span>
                          <span className="font-bold text-primary">৳{Number(selectedOrder.commission).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Tracking Number */}
                    {selectedOrder.tracking_number && (
                      <div className="bg-accent/50 border border-primary/10 rounded-lg p-3 flex items-center gap-3">
                        <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Tracking Number</div>
                          <div className="text-sm font-mono font-bold text-primary mt-0.5">{selectedOrder.tracking_number}</div>
                        </div>
                      </div>
                    )}

                    {/* Pipeline visual */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Fulfillment Pipeline</h3>
                      <div className="flex items-center gap-1">
                        {ORDER_PIPELINE.map((step, i) => {
                          const currentIndex = ORDER_PIPELINE.findIndex((p) => p.status === displayStatus);
                          const reached = i <= currentIndex;
                          const isCancelled = selectedOrder.status === "cancelled";
                          const StepIcon = statusIcons[step.status];
                          return (
                            <div key={step.status} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isCancelled
                                  ? "bg-destructive/10"
                                  : reached
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                              }`}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[9px] text-center leading-tight ${reached && !isCancelled ? "text-primary font-medium" : "text-muted-foreground"}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    {(role === "admin" || role === "warehouse") && selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                      <div className="flex gap-2 pt-2">
                        {canAdvance(selectedOrder.status) && (
                          <Button
                            className="flex-1 gap-1.5"
                            disabled={updateStatus.isPending}
                            onClick={() => advanceOrder(selectedOrder.id, selectedOrder.status)}
                          >
                            <ArrowRight className="w-4 h-4" /> {nextLabel[displayStatus]}
                          </Button>
                        )}
                        {canCancel(selectedOrder.status) && (
                          <Button
                            variant="outline"
                            className="text-destructive"
                            disabled={updateStatus.isPending}
                            onClick={() => cancelOrder(selectedOrder.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default OrderManagement;
