import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ShoppingCart, TrendingUp, Package, Wallet, ArrowUpRight, ArrowDownRight, ExternalLink, Copy, Check, Share2, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { dropshipProducts } from "@/data/dropshipProducts";
import { mockDropshipOrders } from "@/data/dropshipProducts";
import { useToast } from "@/hooks/use-toast";

const DropshipperDashboard = () => {
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState<string | null>(null);

  // Compute stats from mock data
  const totalOrders = mockDropshipOrders.length;
  const totalSales = mockDropshipOrders.reduce((s, o) => s + o.retailPrice * o.quantity, 0);
  const totalCommission = mockDropshipOrders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.commission, 0);
  const pendingCommission = mockDropshipOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").reduce((s, o) => s + o.commission, 0);
  const productsPromoted = dropshipProducts.length;
  const conversionRate = totalOrders > 0 ? ((mockDropshipOrders.filter((o) => o.status === "delivered").length / totalOrders) * 100).toFixed(0) : "0";

  const stats = [
    { label: "Total Sales", value: `৳${totalSales.toLocaleString()}`, change: "+18%", up: true, icon: TrendingUp },
    { label: "Total Orders", value: totalOrders.toString(), change: "+4", up: true, icon: ShoppingCart },
    { label: "Commission Earned", value: `৳${totalCommission.toLocaleString()}`, change: "+৳460", up: true, icon: Wallet },
    { label: "Pending Commission", value: `৳${pendingCommission.toLocaleString()}`, change: `${conversionRate}% conv.`, up: true, icon: DollarSign },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-secondary text-secondary-foreground",
    confirmed: "bg-accent text-accent-foreground",
    processing: "bg-accent text-accent-foreground",
    shipped: "bg-primary/10 text-primary",
    delivered: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const handleCopyLink = (productId: string) => {
    navigator.clipboard.writeText(`https://shop.prodpartner.com/p/${productId}?ref=dropshipper123`);
    setLinkCopied(productId);
    toast({ title: "Link Copied!", description: "Share this referral link to earn commission." });
    setTimeout(() => setLinkCopied(null), 2000);
  };

  // Top performing products (sorted by totalSold)
  const topProducts = [...dropshipProducts].sort((a, b) => b.totalSold - a.totalSold).slice(0, 4);

  return (
    <DashboardLayout role="dropshipper">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Dropshipper Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Promote products, generate orders, earn commission</p>
          </div>
          <Link to="/dropshipper/products">
            <Button className="gap-2">
              <ExternalLink className="w-4 h-4" /> Browse Products
            </Button>
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

        {/* Commission Breakdown */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> How You Earn
          </h2>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Customer Pays</div>
                <div className="text-lg font-bold">৳600</div>
                <div className="text-[10px] text-muted-foreground">Retail Price</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Platform Charges</div>
                <div className="text-lg font-bold">৳420</div>
                <div className="text-[10px] text-muted-foreground">Dropship Price</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-2">
                <div className="text-xs text-primary mb-1">You Keep</div>
                <div className="text-lg font-bold text-primary">৳180</div>
                <div className="text-[10px] text-primary">Your Profit</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              No upfront cost. No inventory risk. Promote → Customer orders → Platform ships → You earn.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products to Promote */}
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Top Products</h2>
              <Link to="/dropshipper/products">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {topProducts.map((product) => (
                <div key={product.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xl">{product.image}</div>
                    <div>
                      <div className="text-sm font-medium line-clamp-1">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ৳{product.retailPrice} retail · <span className="text-primary font-medium">৳{product.sellerProfit} profit</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleCopyLink(product.id)}>
                    {linkCopied === product.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {linkCopied === product.id ? "Copied" : "Link"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
              <Link to="/dropshipper/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {mockDropshipOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {order.id}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {order.customerName} · {order.productName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">৳{(order.retailPrice * order.quantity).toLocaleString()}</div>
                    <div className="text-xs text-primary font-medium">+৳{order.commission.toLocaleString()}</div>
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

export default DropshipperDashboard;
