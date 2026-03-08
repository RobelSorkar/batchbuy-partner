import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, Clock, Truck, CheckCircle, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockDropshipOrders, DropshipOrder } from "@/data/dropshipProducts";

const statusConfig: Record<DropshipOrder["status"], { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-secondary text-secondary-foreground", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "bg-accent text-accent-foreground", label: "Confirmed" },
  processing: { icon: Package, color: "bg-accent text-accent-foreground", label: "Processing" },
  shipped: { icon: Truck, color: "bg-primary/10 text-primary", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "bg-primary/10 text-primary", label: "Delivered" },
  cancelled: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Cancelled" },
};

const filterOptions = ["all", "pending", "processing", "shipped", "delivered"] as const;

const DropshipperOrders = () => {
  const [filter, setFilter] = useState<string>("all");

  const orders = mockDropshipOrders.filter((o) => filter === "all" || o.status === filter);
  const totalCommission = mockDropshipOrders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.commission, 0);
  const pendingCommission = mockDropshipOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").reduce((s, o) => s + o.commission, 0);

  return (
    <DashboardLayout role="dropshipper">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your dropship orders and commissions</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-display font-bold mt-1">{mockDropshipOrders.length}</div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Earned Commission</div>
            <div className="text-2xl font-display font-bold text-primary mt-1">৳{totalCommission.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Pending Commission</div>
            <div className="text-2xl font-display font-bold mt-1">৳{pendingCommission.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f === "all" ? "All Orders" : f}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={order.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xl flex-shrink-0">
                    {statusConfig[order.status].icon === Truck ? "🚚" : "📦"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-sm">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">{order.productName} × {order.quantity}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.customerName} · {order.customerAddress}
                    </div>
                    <div className="text-xs text-muted-foreground">{order.createdAt}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-muted-foreground">Customer Paid</div>
                  <div className="text-sm font-semibold">৳{(order.retailPrice * order.quantity).toLocaleString()}</div>
                  <div className="text-xs text-primary font-semibold mt-1">
                    Commission: ৳{order.commission.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No orders found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DropshipperOrders;
