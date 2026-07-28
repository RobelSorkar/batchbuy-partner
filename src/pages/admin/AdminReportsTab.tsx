import { BarChart3, PieChart, Layers, ShoppingCart } from "lucide-react";
import { AdminUser } from "@/hooks/useAdminData";
import { useOrders } from "@/hooks/useOrders";

type Order = NonNullable<ReturnType<typeof useOrders>["data"]>[number];

interface AdminReportsTabProps {
  orders: Order[];
  users: AdminUser[];
  totalWalletBalance: number;
  totalInvested: number;
  projectStatusCounts: { funding: number; production: number; completed: number };
}

const AdminReportsTab = ({ orders, users, totalWalletBalance, totalInvested, projectStatusCounts }: AdminReportsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Financial Summary
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Order Revenue", value: `৳${orders.reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString()}`, sub: `${orders.length} orders` },
            { label: "Total Commissions", value: `৳${orders.reduce((s, o) => s + Number(o.commission || 0), 0).toLocaleString()}`, sub: "Paid to sellers" },
            { label: "Total Wallet Balance", value: `৳${totalWalletBalance.toLocaleString()}`, sub: `${users.length} users` },
            { label: "Total Invested", value: `৳${totalInvested.toLocaleString()}`, sub: "In production batches" },
          ].map((item) => (
            <div key={item.label} className="bg-muted/30 rounded-lg p-4">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="text-xl font-display font-bold mt-1">{item.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" /> User Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: "Production Partners", count: users.filter((u) => u.role === "partner").length, color: "bg-primary" },
              { label: "Sales Partners", count: users.filter((u) => u.role === "dropshipper").length, color: "bg-accent" },
              { label: "Distributors", count: users.filter((u) => u.role === "distributor").length, color: "bg-secondary" },
              { label: "Warehouse", count: users.filter((u) => u.role === "warehouse").length, color: "bg-muted" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.count} ({users.length > 0 ? ((item.count / users.length) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${users.length > 0 ? (item.count / users.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Project Status
          </h2>
          <div className="space-y-3">
            {[
              { label: "Funding", count: projectStatusCounts.funding, color: "bg-accent" },
              { label: "In Production", count: projectStatusCounts.production, color: "bg-secondary" },
              { label: "Completed", count: projectStatusCounts.completed, color: "bg-primary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-lg font-display font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" /> Order Analytics
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Orders", value: orders.length },
            { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
            { label: "In Transit", value: orders.filter((o) => ["shipped", "out_for_delivery"].includes(o.status)).length },
            { label: "Processing", value: orders.filter((o) => ["pending", "confirmed", "processing", "packed"].includes(o.status)).length },
            { label: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length },
          ].map((item) => (
            <div key={item.label} className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsTab;
