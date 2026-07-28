import { Link } from "react-router-dom";
import { Clock, AlertTriangle, CheckCircle, ShoppingCart, Package, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUser } from "@/hooks/useAdminData";
import { ProjectRow } from "@/hooks/useProjects";
import { useOrders } from "@/hooks/useOrders";
import { roleColors } from "./adminStyles";

type Order = NonNullable<ReturnType<typeof useOrders>["data"]>[number];

interface AdminOverviewTabProps {
  pendingWithdrawalsCount: number;
  pendingWithdrawalTotal: number;
  projectStatusCounts: { funding: number; production: number; completed: number };
  orders: Order[];
  users: AdminUser[];
  batches: ProjectRow[];
  totalWarehouseStock: number;
  onNavigateTab: (tab: string) => void;
}

const AdminOverviewTab = ({
  pendingWithdrawalsCount,
  pendingWithdrawalTotal,
  projectStatusCounts,
  orders,
  users,
  batches,
  totalWarehouseStock,
  onNavigateTab,
}: AdminOverviewTabProps) => {
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Pending Actions</h2>
          </div>
          <div className="p-5 space-y-4">
            {pendingWithdrawalsCount > 0 && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-accent-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{pendingWithdrawalsCount} withdrawal requests totaling ৳{pendingWithdrawalTotal.toLocaleString()}</p>
                  <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => onNavigateTab("withdrawals")}>Process →</Button>
                </div>
              </div>
            )}
            {projectStatusCounts.funding > 0 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-accent-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{projectStatusCounts.funding} projects currently in funding</p>
                  <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => onNavigateTab("batches")}>Review →</Button>
                </div>
              </div>
            )}
            {pendingOrdersCount > 0 && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{pendingOrdersCount} orders awaiting confirmation</p>
                  <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => onNavigateTab("orders")}>View →</Button>
                </div>
              </div>
            )}
            {pendingWithdrawalsCount === 0 && projectStatusCounts.funding === 0 && (
              <p className="text-sm text-muted-foreground">No pending actions.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Recent Users</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab("users")}>View All</Button>
          </div>
          <div className="divide-y divide-border/30">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.joined}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {user.roles.map((r) => (
                    <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[r] || ""}`}>
                      {r === "dropshipper" ? "sales" : r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="p-8 text-center text-muted-foreground">No users yet.</div>}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Manage Orders", icon: ShoppingCart, href: "/admin/orders", desc: `${orders.length} total orders` },
          { label: "Warehouse", icon: Package, href: "/warehouse", desc: `${Math.max(0, totalWarehouseStock)} units in stock` },
          { label: "Marketplace", icon: Layers, href: "/marketplace", desc: `${batches.length} projects` },
          { label: "Create Project", icon: Layers, href: "/create-batch", desc: "Launch new production" },
        ].map((link) => (
          <Link key={link.label} to={link.href} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all group">
            <link.icon className="w-5 h-5 text-primary mb-2" />
            <div className="text-sm font-semibold group-hover:text-primary transition-colors">{link.label}</div>
            <div className="text-xs text-muted-foreground">{link.desc}</div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default AdminOverviewTab;
