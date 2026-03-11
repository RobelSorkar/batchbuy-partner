import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users, TrendingUp, Layers, Package, ShoppingCart, Wallet,
  ArrowUpRight, ArrowDownRight, BarChart3, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const projectStatusCounts = batches.reduce((acc: any, b: any) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const projectStatusData = Object.entries(projectStatusCounts).map(([name, value]) => ({
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
    { label: "Total Partners", value: totalPartners.toString(), change: `${participations.length} participations`, up: true, icon: Users, link: "/admin/users" },
    { label: "Total Sales", value: `৳${(totalSales / 100000).toFixed(1)}L`, change: `${totalOrders} orders`, up: totalSales > 0, icon: TrendingUp, link: "/admin/orders" },
    { label: "Active Projects", value: activeBatches.toString(), change: `${batches.length} total`, up: activeBatches > 0, icon: Layers, link: "/admin" },
    { label: "Warehouse Stock", value: totalStock.toLocaleString(), change: `${inventory.length} products`, up: false, icon: Package, link: "/warehouse" },
    { label: "Total Orders", value: totalOrders.toString(), change: "all channels", up: totalOrders > 0, icon: ShoppingCart, link: "/admin/orders" },
    { label: "Commissions", value: `৳${totalCommission.toLocaleString()}`, change: "total earned", up: totalCommission > 0, icon: Wallet, link: "/wallet" },
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

  // Monthly revenue trend (last 6 months)
  const monthlyRevenue = (() => {
    const now = new Date();
    const months: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
      const monthOrders = orders.filter((o: any) => {
        const od = new Date(o.created_at);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      months.push({
        label,
        revenue: monthOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0),
        orders: monthOrders.length,
      });
    }
    return months;
  })();

  // Order channel breakdown
  const channelColors: Record<string, string> = {
    platform: "hsl(var(--primary))",
    dropshipper: "hsl(var(--accent))",
    retail: "hsl(var(--secondary))",
    distributor: "hsl(160, 60%, 45%)",
  };
  const channelCounts = orders.reduce((acc: any, o: any) => {
    acc[o.channel] = (acc[o.channel] || 0) + 1;
    return acc;
  }, {});
  const channelLabels: Record<string, string> = {
    dropshipper: "Sales Partners",
    platform: "Platform",
    retail: "Retail",
    distributor: "Distributor",
  };
  const channelData = Object.entries(channelCounts).map(([name, value]) => ({
    name: channelLabels[name] || name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    fill: channelColors[name] || "hsl(var(--muted))",
  }));

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
            <div
              key={stat.label}
              onClick={() => navigate(stat.link)}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
            >
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
            <h2 className="font-display font-semibold text-lg mb-4">Project Status Overview</h2>
            {projectStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {projectStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {projectStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-10 text-sm">No projects yet</div>
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

        {/* Monthly Revenue Trend + Order Channel Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Monthly Revenue Trend</h2>
            {monthlyRevenue.some((m) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v > 1000 ? `৳${(v / 1000).toFixed(0)}K` : `৳${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-10 text-sm">No revenue data yet</div>
            )}
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Order Channel Breakdown</h2>
            {channelData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={channelData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {channelData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {channelData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-10 text-sm">No orders yet</div>
            )}
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Top Partners by Investment</h2>
          {topPartners.length > 0 ? (
            <div className="space-y-3">
              {topPartners.map((p, i) => (
                <div key={p.userId} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
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
