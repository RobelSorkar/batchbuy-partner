import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Layers, Package, Users, TrendingUp, Warehouse, Banknote,
  BarChart3, Loader2, ArrowRight, ShieldCheck
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const TransparencyDashboard = () => {
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["transparency-batches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("batches").select("id, status, total_quantity, funded_units, partners_joined, product_name, created_at, production_cost_per_unit");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const { data: inventory = [], isLoading: invLoading } = useQuery({
    queryKey: ["transparency-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("id, product_name, total_stock, sold_units, status, warehouse_location");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const isLoading = batchesLoading || invLoading;

  // Derived stats
  const totalBatches = batches.length;
  const totalUnitsProduced = batches
    .filter((b: any) => b.status === "completed" || b.status === "production")
    .reduce((s: number, b: any) => s + b.total_quantity, 0);
  const totalUnitsFunded = batches.reduce((s: number, b: any) => s + b.funded_units, 0);
  const totalUnitsSold = inventory.reduce((s: number, i: any) => s + i.sold_units, 0);
  const activePartners = new Set(
    batches.filter((b: any) => b.partners_joined > 0).flatMap(() => [])
  ).size;
  const totalPartnersJoined = batches.reduce((s: number, b: any) => s + b.partners_joined, 0);
  const warehouseStock = inventory.reduce((s: number, i: any) => s + (i.total_stock - i.sold_units), 0);
  const totalInvestment = batches.reduce((s: number, b: any) => s + (b.funded_units * Number(b.production_cost_per_unit)), 0);

  // Batch status distribution
  const statusCounts = batches.reduce((acc: any, b: any) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const statusLabels: Record<string, string> = {
    funding: "Funding", production: "Production", completed: "Completed", cancelled: "Cancelled",
  };
  const statusColors: Record<string, string> = {
    funding: "hsl(45, 93%, 47%)", production: "hsl(220, 70%, 55%)",
    completed: "hsl(160, 84%, 39%)", cancelled: "hsl(0, 72%, 51%)",
  };
  const projectStatusData = Object.entries(statusCounts).map(([key, value]) => ({
    name: statusLabels[key] || key, value: value as number, fill: statusColors[key] || "hsl(var(--muted))",
  }));

  // Monthly batch creation trend (last 8 months)
  const monthlyBatches = (() => {
    const now = new Date();
    const months: { label: string; batches: number; units: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleString("en", { month: "short" });
      const monthBatches = batches.filter((b: any) => {
        const bd = new Date(b.created_at);
        return bd >= d && bd < nextMonth;
      });
      months.push({
        label,
        batches: monthBatches.length,
        units: monthBatches.reduce((s: number, b: any) => s + b.total_quantity, 0),
      });
    }
    return months;
  })();

  // Warehouse inventory by product
  const warehouseData = inventory
    .map((item: any) => ({
      product: item.product_name.length > 18 ? item.product_name.substring(0, 18) + "…" : item.product_name,
      inStock: item.total_stock - item.sold_units,
      sold: item.sold_units,
    }))
    .sort((a: any, b: any) => (b.inStock + b.sold) - (a.inStock + a.sold))
    .slice(0, 8);

  const statCards = [
    { label: "Total Projects", value: totalBatches, icon: Layers, color: "from-primary/20 to-primary/5", iconColor: "text-primary" },
    { label: "Units Produced", value: totalUnitsProduced.toLocaleString(), icon: Package, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500" },
    { label: "Units Sold", value: totalUnitsSold.toLocaleString(), icon: TrendingUp, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500" },
    { label: "Partners Joined", value: totalPartnersJoined, icon: Users, color: "from-violet-500/20 to-violet-500/5", iconColor: "text-violet-500" },
    { label: "Warehouse Stock", value: warehouseStock.toLocaleString(), icon: Warehouse, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-500" },
    { label: "Total Invested", value: `৳${(totalInvestment / 100000).toFixed(1)}L`, icon: Banknote, color: "from-rose-500/20 to-rose-500/5", iconColor: "text-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 py-12 sm:py-16 relative">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                Live Platform Data
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
                Transparency <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
                Real-time platform statistics. Every project, every unit, every partner — tracked and visible.
              </p>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="container mx-auto px-4 space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 border border-border/30 hover:border-border/60 transition-all`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor} mb-3`} />
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Batch Growth */}
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">Project Growth Trend</h2>
                </div>
                {monthlyBatches.some((m) => m.batches > 0) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyBatches}>
                      <defs>
                        <linearGradient id="batchGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="units" name="Units" stroke="hsl(160, 84%, 39%)" fill="url(#batchGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-16 text-sm">No project data yet</div>
                )}
              </div>

              {/* Batch Status */}
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">Project Status Distribution</h2>
                </div>
                {batchStatusData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={batchStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          dataKey="value"
                          label={({ name, value }) => `${name} (${value})`}
                          labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                        >
                          {batchStatusData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-3 flex-wrap">
                      {batchStatusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-16 text-sm">No projects yet</div>
                )}
              </div>
            </div>

            {/* Warehouse Inventory Chart */}
            {warehouseData.length > 0 && (
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Warehouse className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">Warehouse Inventory</h2>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(200, warehouseData.length * 45)}>
                  <BarChart data={warehouseData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="product" type="category" width={120} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="inStock" name="In Stock" stackId="a" fill="hsl(160, 84%, 39%)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="sold" name="Sold" stackId="a" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Key Metrics Summary */}
            <div className="bg-gradient-to-r from-foreground to-foreground/90 rounded-2xl p-8 text-primary-foreground">
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-display font-bold">{totalUnitsFunded.toLocaleString()}</div>
                  <div className="text-sm opacity-80 mt-1">Units Funded by Partners</div>
                </div>
                <div>
                  <div className="text-3xl font-display font-bold">{Math.round((totalUnitsSold / (totalUnitsProduced || 1)) * 100)}%</div>
                  <div className="text-sm opacity-80 mt-1">Sell-Through Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-display font-bold">{totalBatches > 0 ? Math.round(totalPartnersJoined / totalBatches) : 0}</div>
                  <div className="text-sm opacity-80 mt-1">Avg Partners Per Project</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Ready to join the next production project?</p>
              <Link to="/marketplace">
                <Button size="lg" className="gap-2">
                  Browse Active Projects <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TransparencyDashboard;
