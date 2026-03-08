import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, Clock, Truck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
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
  const { data: allOrders, isLoading } = useOrders("dropshipper");

  const dropshipOrders = (allOrders || []).filter((o: any) => o.channel === "dropship");
  const orders = dropshipOrders.filter((o: any) => filter === "all" || o.status === filter);
  const totalCommission = dropshipOrders
    .filter((o: any) => o.status === "delivered")
    .reduce((s: number, o: any) => s + Number(o.commission || 0), 0);
  const pendingCommission = dropshipOrders
    .filter((o: any) => o.status !== "delivered" && o.status !== "cancelled")
    .reduce((s: number, o: any) => s + Number(o.commission || 0), 0);

  if (isLoading) {
    return (
      <DashboardLayout role="dropshipper">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="dropshipper">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your dropship orders and commissions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-display font-bold mt-1">{dropshipOrders.length}</div>
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

        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f === "all" ? "All Orders" : f}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {orders.map((order: any) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const items = order.order_items || [];
            return (
              <div key={order.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xl flex-shrink-0">
                    {order.status === "shipped" ? "🚚" : "📦"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-sm">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {items.map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.customer_name} · {order.customer_address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-muted-foreground">Customer Paid</div>
                  <div className="text-sm font-semibold">৳{Number(order.total_amount).toLocaleString()}</div>
                  <div className="text-xs text-primary font-semibold mt-1">
                    Commission: ৳{Number(order.commission || 0).toLocaleString()}
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
