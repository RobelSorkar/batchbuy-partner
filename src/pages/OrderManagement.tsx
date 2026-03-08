import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Package, Truck, ShoppingCart, CheckCircle, Clock, AlertTriangle,
  Search, Eye, ArrowRight, MapPin, Phone, User, Hash, ChevronRight,
  XCircle, Box, PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { mockOrders, Order, OrderStatus, ORDER_PIPELINE, nextStatusMap, statusMeta } from "@/data/orders";
import { useToast } from "@/hooks/use-toast";

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
  dropshipper: "Dropshipper",
  distributor: "Distributor",
  direct: "Direct",
};

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Placed", value: "placed" },
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

const OrderManagement = ({ role = "admin" }: OrderManagementProps) => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSource = sourceFilter === "all" || o.source === sourceFilter;
    const matchSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSource && matchSearch;
  });

  // Stats
  const totalOrders = orders.length;
  const pendingAction = orders.filter((o) => ["placed", "confirmed", "processing", "packed"].includes(o.status)).length;
  const inTransit = orders.filter((o) => ["shipped", "out_for_delivery"].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.retailPrice * o.quantity, 0);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "" },
    { label: "Pending Action", value: pendingAction, icon: Clock, color: "text-accent-foreground" },
    { label: "In Transit", value: inTransit, icon: Truck, color: "text-primary" },
    { label: "Delivered", value: completed, icon: CheckCircle, color: "text-primary" },
    { label: "Cancelled", value: cancelled, icon: XCircle, color: "text-destructive" },
  ];

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = nextStatusMap[o.status];
        if (!next) return o;
        const now = new Date();
        const timestamp = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
        const pipelineStep = ORDER_PIPELINE.find((p) => p.status === next);
        const updated: Order = {
          ...o,
          status: next,
          timeline: [
            ...o.timeline,
            { status: next, label: pipelineStep?.label || next, timestamp },
          ],
        };
        // Auto-assign tracking number when shipped
        if (next === "shipped" && !updated.trackingNumber) {
          updated.trackingNumber = `TRK-BD-${Math.floor(10000 + Math.random() * 90000)}`;
          updated.timeline[updated.timeline.length - 1].note = `Tracking: ${updated.trackingNumber}`;
        }
        setSelectedOrder(updated);
        toast({ title: "Order Updated", description: `${o.id} → ${pipelineStep?.label}` });
        return updated;
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (["shipped", "out_for_delivery", "delivered", "cancelled"].includes(o.status)) return o;
        const now = new Date();
        const timestamp = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
        const updated: Order = {
          ...o,
          status: "cancelled",
          timeline: [...o.timeline, { status: "cancelled", label: "Cancelled", timestamp, note: "Order cancelled" }],
        };
        setSelectedOrder(updated);
        toast({ title: "Order Cancelled", description: `${o.id} has been cancelled.`, variant: "destructive" });
        return updated;
      })
    );
  };

  const canAdvance = (status: OrderStatus) => !!nextStatusMap[status];
  const canCancel = (status: OrderStatus) => !["shipped", "out_for_delivery", "delivered", "cancelled"].includes(status);

  const nextLabel: Partial<Record<OrderStatus, string>> = {
    placed: "Confirm Order",
    confirmed: "Start Processing",
    processing: "Mark Packed",
    packed: "Ship Order",
    shipped: "Out for Delivery",
    out_for_delivery: "Mark Delivered",
  };

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
            <Input placeholder="Search by order ID, customer, product, tracking..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["all", "dropshipper", "distributor", "direct"].map((s) => (
              <Button key={s} variant={sourceFilter === s ? "default" : "outline"} size="sm" onClick={() => setSourceFilter(s)} className="capitalize">
                {s === "all" ? "All Sources" : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((f) => {
            const count = f.value === "all" ? orders.length : orders.filter((o) => o.status === f.value).length;
            return (
              <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm" onClick={() => setFilter(f.value)}>
                {f.label} <span className="ml-1 text-xs opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filtered.map((order) => {
            const meta = statusMeta[order.status];
            const StatusIcon = statusIcons[order.status];
            return (
              <div
                key={order.id}
                className="bg-card rounded-xl shadow-card border border-border/50 p-5 hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center text-2xl flex-shrink-0">
                      {order.productImage}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-sm">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                          {sourceLabels[order.source]}
                        </span>
                      </div>
                      <div className="text-sm mt-0.5">{order.productName} × {order.quantity}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.customerName}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.customerAddress.split(",").slice(-1)[0].trim()}</span>
                        {order.trackingNumber && (
                          <span className="flex items-center gap-1 text-primary"><Hash className="w-3 h-3" /> {order.trackingNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold">৳{(order.retailPrice * order.quantity).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{order.createdAt}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Mini pipeline */}
                <div className="mt-4 flex items-center gap-1">
                  {ORDER_PIPELINE.map((step, i) => {
                    const stepIndex = ORDER_PIPELINE.findIndex((p) => p.status === order.status);
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
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedOrder.id}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta[selectedOrder.status].color}`}>
                      {statusMeta[selectedOrder.status].label}
                    </span>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedOrder.productName} × {selectedOrder.quantity}
                  </DialogDescription>
                </DialogHeader>

                {/* Order Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Customer</div>
                      <div className="text-sm font-medium mt-1">{selectedOrder.customerName}</div>
                      <div className="text-xs text-muted-foreground">{selectedOrder.customerPhone}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Delivery</div>
                      <div className="text-xs font-medium mt-1">{selectedOrder.customerAddress}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Source</div>
                      <div className="text-sm font-medium mt-1">{sourceLabels[selectedOrder.source]}</div>
                      {selectedOrder.dropshipperName && (
                        <div className="text-xs text-muted-foreground">{selectedOrder.dropshipperName}</div>
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Shipping</div>
                      <div className="text-sm font-medium mt-1">{selectedOrder.shippingMethod}</div>
                      {selectedOrder.trackingNumber && (
                        <div className="text-xs text-primary font-mono">{selectedOrder.trackingNumber}</div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Retail Price × {selectedOrder.quantity}</span>
                      <span className="font-semibold">৳{(selectedOrder.retailPrice * selectedOrder.quantity).toLocaleString()}</span>
                    </div>
                    {selectedOrder.source === "dropshipper" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dropship Cost</span>
                          <span>৳{(selectedOrder.dropshipPrice * selectedOrder.quantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
                          <span className="text-primary font-medium">Commission</span>
                          <span className="font-bold text-primary">৳{selectedOrder.commission.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Order Timeline</h3>
                    <div className="relative pl-6 space-y-4">
                      {/* Vertical line */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />
                      {selectedOrder.timeline.map((event, i) => {
                        const isCancelled = event.status === "cancelled";
                        const isLatest = i === selectedOrder.timeline.length - 1;
                        return (
                          <div key={i} className="relative flex items-start gap-3">
                            <div className={`absolute -left-6 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 ${
                              isCancelled
                                ? "bg-destructive/10 border-destructive"
                                : isLatest
                                  ? "bg-primary border-primary"
                                  : "bg-card border-primary/50"
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                isCancelled ? "bg-destructive" : isLatest ? "bg-primary-foreground" : "bg-primary/50"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm font-medium ${isCancelled ? "text-destructive" : ""}`}>{event.label}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                              </div>
                              {event.note && (
                                <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pipeline visual */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Fulfillment Pipeline</h3>
                    <div className="flex items-center gap-1">
                      {ORDER_PIPELINE.map((step, i) => {
                        const currentIndex = ORDER_PIPELINE.findIndex((p) => p.status === selectedOrder.status);
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
                        <Button className="flex-1 gap-1.5" onClick={() => advanceOrder(selectedOrder.id)}>
                          <ArrowRight className="w-4 h-4" /> {nextLabel[selectedOrder.status]}
                        </Button>
                      )}
                      {canCancel(selectedOrder.status) && (
                        <Button variant="outline" className="text-destructive" onClick={() => cancelOrder(selectedOrder.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default OrderManagement;
