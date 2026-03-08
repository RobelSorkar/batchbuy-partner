import DashboardLayout from "@/components/DashboardLayout";
import { Users, Layers, TrendingUp, ShoppingCart, ArrowUpRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Users", value: "1,247", change: "+82 this month", icon: Users },
  { label: "Active Batches", value: "12", change: "3 in funding", icon: Layers },
  { label: "Platform Revenue", value: "৳4.2Cr", change: "+23% MoM", icon: TrendingUp },
  { label: "Total Orders", value: "3,841", change: "+312 this week", icon: ShoppingCart },
];

const recentUsers = [
  { name: "Rahim Ahmed", role: "Production Partner", joined: "Mar 7, 2026", status: "active" },
  { name: "Fatima Khatun", role: "Dropshipper", joined: "Mar 6, 2026", status: "active" },
  { name: "Kamal Hossain", role: "Distributor", joined: "Mar 5, 2026", status: "pending" },
  { name: "Nasrin Begum", role: "Production Partner", joined: "Mar 4, 2026", status: "active" },
  { name: "Jamal Uddin", role: "Dropshipper", joined: "Mar 3, 2026", status: "suspended" },
];

const pendingActions = [
  { text: "3 new batch proposals awaiting approval", type: "warning", action: "Review" },
  { text: "Withdrawal request: ৳50,000 from Rahim Ahmed", type: "warning", action: "Process" },
  { text: "Batch #42 production completed — verify delivery", type: "info", action: "Verify" },
  { text: "2 user reports pending review", type: "alert", action: "Review" },
];

const userStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent text-accent-foreground",
  suspended: "bg-destructive/10 text-destructive",
};

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-primary">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Actions */}
          <div className="lg:col-span-1 bg-card rounded-xl shadow-card border border-border/50">
            <div className="p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Pending Actions</h2>
            </div>
            <div className="p-5 space-y-4">
              {pendingActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {action.type === "alert" ? (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : action.type === "warning" ? (
                      <Clock className="w-4 h-4 text-accent-foreground" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{action.text}</p>
                    <Button variant="link" size="sm" className="px-0 h-auto text-xs">
                      {action.action} →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Recent Users</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Joined</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.name} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{user.role}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${userStatusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="ghost" size="sm">Manage</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
