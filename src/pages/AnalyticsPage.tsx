import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users, TrendingUp, Layers, Package, ShoppingCart, Wallet,
  ArrowUpRight, ArrowDownRight, BarChart3, Loader2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {typeof entry.value === "number" && entry.value > 1000
              ? `৳${(entry.value / 1000).toFixed(0)}K`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["analytics-batches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("batches").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["analytics-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)");
      if (error) throw error;
      return data;
    },
  });

  const { data: inventory = [], isLoading: invLoading } = useQuery({
    queryKey: ["analytics-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: participations = [] } = useQuery({
    queryKey: ["analytics-participations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("batch_participations").select("*, profiles:user_id(full_name)");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = batchesLoading || ordersLoading || invLoading;

  // Compute stats from real data
  const totalPartners = new Set(participations.map((p: any) => p.user_id)).size;
  const totalSales = orders.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
  const activeBatches = batches.filter((b: any) => b.status === "funding" || b.status === "production").length;
  const totalStock = inventory.reduce((s: number, i: any) => s + i.total_stock, 0);
  const totalOrders = orders.length;
  const totalCommission = orders.reduce((s: number, o: any) => s + Number(o.commission || 0), 0);

  const batchStatusCounts = batches.reduce((acc: any, b: any) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const batchStatusData = Object.entries(batchStatusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    fill: name === "funding" ? "hsl(var(--accent))" : name === "production" ? "hsl(var(--secondary))" : name === "completed" ? "hsl(var(--primary))" : "hsl(var(--muted))",
  }));

  const warehouseStock = inventory.map((item: any) => ({
    product: item.product_name.length > 15 ? item.product_name.substring(0, 15) + "…" : item.product_name,
    inStock: item.total_stock - item.sold_units,
    sold: item.sold_units,
  }));

  const stats = [
    { label: "Total Partners", value: totalPartners.toString(), change: `${participations.length} participations`, up: true, icon: Users },
    { label: "Total Sales", value: `৳${(totalSales / 100000).toFixed(1)}L`, change: `${totalOrders} orders`, up: totalSales > 0, icon: TrendingUp },
    { label: "Active Batches", value: activeBatches.toString(), change: `${batches.length} total`, up: activeBatches > 0, icon: Layers },
    { label: "Warehouse Stock", value: totalStock.toLocaleString(), change: `${inventory.length} products`, up: false, icon: Package },
    { label: "Total Orders", value: totalOrders.toString(), change: "all channels", up: totalOrders > 0, icon: ShoppingCart },
    { label: "Commissions", value: `৳${totalCommission.toLocaleString()}`, change: "total earned", up: totalCommission > 0, icon: Wallet },
  ];

  // Top partners by investment
  const partnerInvestments = participations.reduce((acc: any, p: any) => {
    if (!acc[p.user_id]) acc[p.user_id] = { invested: 0, name: p.profiles?.full_name || "Unknown" };
    acc[p.user_id].invested += Number(p.total_invested);
    return acc;
  }, {});
  const topPartners = Object.entries(partnerInvestments)
    .map(([userId, data]: [string, any]) => ({ userId, invested: data.invested, name: data.name }))
    .sort((a, b) => b.invested - a.invested)
    .slice(0, 5);

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Platform Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Live data from your database</p>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
                <stat.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="text-xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${stat.up ? "text-primary" : "text-muted-foreground"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Batch Status + Warehouse Stock */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Batch Status Overview</h2>
            {batchStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={batchStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {batchStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
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
              <div className="text-center text-muted-foreground py-10 text-sm">No batches yet</div>
            )}
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Warehouse Inventory</h2>
            {warehouseStock.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={warehouseStock} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="product" type="category" width={100} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="inStock" name="In Stock" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="sold" name="Sold" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-10 text-sm">No inventory data</div>
            )}
          </div>
        </div>

        {/* Top Partners */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Top Partners by Investment</h2>
          {topPartners.length > 0 ? (
            <div className="space-y-3">
              {topPartners.map((p, i) => (
                <div key={p.userId} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{p.userId.substring(0, 8)}…</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">৳{p.invested.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10 text-sm">No participation data yet</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
