import DashboardLayout from "@/components/DashboardLayout";
import { Package, TrendingUp, Wallet, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Investment", value: "৳125,000", change: "+12%", up: true, icon: TrendingUp },
  { label: "Owned Units", value: "248", change: "+24", up: true, icon: Package },
  { label: "Active Batches", value: "4", change: "+1", up: true, icon: Layers },
  { label: "Wallet Balance", value: "৳32,450", change: "+৳5,200", up: true, icon: Wallet },
];

const recentBatches = [
  { name: "Premium Cotton T-Shirts", status: "Production", units: 50, invested: "৳25,000", progress: 72 },
  { name: "Organic Skincare Set", status: "Funding", units: 30, invested: "৳15,000", progress: 45 },
  { name: "Leather Accessories", status: "Completed", units: 100, invested: "৳50,000", progress: 100 },
  { name: "Home Decor Collection", status: "Shipping", units: 40, invested: "৳20,000", progress: 88 },
];

const recentActivity = [
  { text: "You invested ৳15,000 in Organic Skincare Set", time: "2 hours ago", type: "investment" },
  { text: "Batch #42 production completed", time: "1 day ago", type: "production" },
  { text: "৳5,200 profit credited to wallet", time: "2 days ago", type: "earning" },
  { text: "New batch available: Bamboo Utensils", time: "3 days ago", type: "new" },
];

const PartnerDashboard = () => {
  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, Partner</h1>
            <p className="text-muted-foreground text-sm mt-1">Your production portfolio overview</p>
          </div>
          <Link to="/marketplace">
            <Button>Browse Batches</Button>
          </Link>
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
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${stat.up ? "text-primary" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Batches Table */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Your Batches</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Batch</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Units</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Invested</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map((batch) => (
                    <tr key={batch.name} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium">{batch.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          batch.status === "Completed" ? "bg-primary/10 text-primary" :
                          batch.status === "Funding" ? "bg-accent text-accent-foreground" :
                          batch.status === "Production" ? "bg-secondary text-secondary-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{batch.units}</td>
                      <td className="px-5 py-4 text-sm font-medium">{batch.invested}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${batch.progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{batch.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
            </div>
            <div className="p-5 space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
