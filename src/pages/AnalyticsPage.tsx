import DashboardLayout from "@/components/DashboardLayout";
import {
  Users, TrendingUp, Layers, Package, ShoppingCart, Wallet,
  ArrowUpRight, ArrowDownRight, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// ── Mock Analytics Data ───────────────────────────────

const monthlySales = [
  { month: "Sep", revenue: 1200000, orders: 180, profit: 340000 },
  { month: "Oct", revenue: 1850000, orders: 245, profit: 520000 },
  { month: "Nov", revenue: 2400000, orders: 310, profit: 680000 },
  { month: "Dec", revenue: 3100000, orders: 420, profit: 890000 },
  { month: "Jan", revenue: 3500000, orders: 480, profit: 1020000 },
  { month: "Feb", revenue: 3800000, orders: 520, profit: 1100000 },
  { month: "Mar", revenue: 4200000, orders: 580, profit: 1250000 },
];

const partnerGrowth = [
  { month: "Sep", partners: 42, dropshippers: 68, distributors: 12 },
  { month: "Oct", partners: 58, dropshippers: 95, distributors: 15 },
  { month: "Nov", partners: 72, dropshippers: 130, distributors: 18 },
  { month: "Dec", partners: 88, dropshippers: 175, distributors: 22 },
  { month: "Jan", partners: 105, dropshippers: 220, distributors: 28 },
  { month: "Feb", partners: 118, dropshippers: 265, distributors: 32 },
  { month: "Mar", partners: 134, dropshippers: 310, distributors: 38 },
];

const batchStatusData = [
  { name: "Funding", value: 4, fill: "hsl(var(--accent))" },
  { name: "Production", value: 3, fill: "hsl(var(--secondary))" },
  { name: "Shipping", value: 2, fill: "hsl(var(--muted))" },
  { name: "Completed", value: 8, fill: "hsl(var(--primary))" },
];

const warehouseStock = [
  { product: "Cotton T-Shirt", inStock: 408, sold: 92, allocated: 500 },
  { product: "Skincare Set", inStock: 255, sold: 45, allocated: 300 },
  { product: "Leather Wallet", inStock: 148, sold: 52, allocated: 200 },
  { product: "Bamboo Utensils", inStock: 676, sold: 124, allocated: 800 },
  { product: "Earbuds Pro", inStock: 150, sold: 0, allocated: 150 },
  { product: "Coffee Blend", inStock: 120, sold: 0, allocated: 1000 },
];

const dropshipOrders = [
  { month: "Sep", orders: 45, commission: 28000 },
  { month: "Oct", orders: 72, commission: 48000 },
  { month: "Nov", orders: 98, commission: 68000 },
  { month: "Dec", orders: 135, commission: 95000 },
  { month: "Jan", orders: 160, commission: 112000 },
  { month: "Feb", orders: 185, commission: 135000 },
  { month: "Mar", orders: 210, commission: 158000 },
];

const partnerProfits = [
  { name: "Rahim Ahmed", invested: 250000, earned: 87000, profit: 87000 },
  { name: "Fatima Khatun", invested: 180000, earned: 54000, profit: 54000 },
  { name: "Kamal Hossain", invested: 320000, earned: 112000, profit: 112000 },
  { name: "Metro Mart BD", invested: 580000, earned: 195000, profit: 195000 },
  { name: "Fashion Hub", invested: 420000, earned: 140000, profit: 140000 },
];

const channelRevenue = [
  { channel: "Platform", revenue: 1680000, pct: 40 },
  { channel: "Dropshipper", revenue: 1260000, pct: 30 },
  { channel: "Retail", revenue: 840000, pct: 20 },
  { channel: "Distributor", revenue: 420000, pct: 10 },
];

const channelPieData = [
  { name: "Platform", value: 40, fill: "hsl(var(--primary))" },
  { name: "Dropshipper", value: 30, fill: "hsl(var(--accent))" },
  { name: "Retail", value: 20, fill: "hsl(var(--secondary))" },
  { name: "Distributor", value: 10, fill: "hsl(var(--muted-foreground))" },
];

// ── Stats ─────────────────────────────────────────────

const stats = [
  { label: "Total Partners", value: "134", change: "+16 this month", up: true, icon: Users },
  { label: "Total Sales", value: "৳4.2Cr", change: "+23% MoM", up: true, icon: TrendingUp },
  { label: "Active Batches", value: "9", change: "4 funding", up: true, icon: Layers },
  { label: "Warehouse Stock", value: "1,757", change: "6 products", up: false, icon: Package },
  { label: "Dropship Orders", value: "905", change: "+210 this month", up: true, icon: ShoppingCart },
  { label: "Partner Profits", value: "৳5.88L", change: "Avg ROI 34%", up: true, icon: Wallet },
];

// ── Custom tooltip ────────────────────────────────────

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

// ── Component ─────────────────────────────────────────

const AnalyticsPage = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Platform Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive data visualization across all operations</p>
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

        {/* Row 1: Revenue & Orders Area Chart + Channel Pie */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Revenue & Profit Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlySales}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--accent-foreground))" fill="url(#profitGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Channel Revenue Split</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={channelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {channelPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {channelRevenue.map((ch) => (
                <div key={ch.channel} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{ch.channel}</span>
                  <span className="font-medium">৳{(ch.revenue / 100000).toFixed(1)}L ({ch.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Partner Growth + Batch Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={partnerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="partners" name="Partners" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="dropshippers" name="Dropshippers" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="distributors" name="Distributors" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Batch Status Overview</h2>
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
          </div>
        </div>

        {/* Row 3: Warehouse Stock Bar + Dropship Orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Warehouse Inventory</h2>
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
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Dropship Orders & Commission</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dropshipOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="orders" name="Orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="commission" name="Commission (৳)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 4: Partner Profits */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Top Partner Profits</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={partnerProfits}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="invested" name="Invested" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="earned" name="Earned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {partnerProfits.sort((a, b) => b.profit - a.profit).map((p, i) => {
                const roi = ((p.earned / p.invested) * 100).toFixed(0);
                return (
                  <div key={p.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">Invested ৳{(p.invested / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">৳{(p.earned / 1000).toFixed(0)}K earned</div>
                      <div className="text-xs text-muted-foreground">{roi}% ROI</div>
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-display font-bold">৳17.5L</div>
                  <div className="text-[10px] text-muted-foreground">Total Invested</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-display font-bold text-primary">৳5.88L</div>
                  <div className="text-[10px] text-primary">Total Earned</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-display font-bold">34%</div>
                  <div className="text-[10px] text-muted-foreground">Avg ROI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
