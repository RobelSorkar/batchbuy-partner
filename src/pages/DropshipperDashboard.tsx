import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ShoppingCart, TrendingUp, Wallet, DollarSign, ArrowUpRight, ExternalLink, Copy, Check, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDropshipProducts } from "@/hooks/useDropshipProducts";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const DropshipperDashboard = () => {
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const { data: products, isLoading: loadingProducts } = useDropshipProducts();
  const { data: orders, isLoading: loadingOrders } = useOrders("dropshipper");

  const totalOrders = (orders || []).length;
  const totalSales = (orders || []).reduce((s, o: any) => s + Number(o.total_amount), 0);
  const totalCommission = (orders || [])
    .filter((o: any) => o.status === "delivered")
    .reduce((s, o: any) => s + Number(o.commission || 0), 0);
  const pendingCommission = (orders || [])
    .filter((o: any) => o.status !== "delivered" && o.status !== "cancelled")
    .reduce((s, o: any) => s + Number(o.commission || 0), 0);

  const stats = [
    { label: "Total Sales", value: `৳${totalSales.toLocaleString()}`, icon: TrendingUp },
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "Commission Earned", value: `৳${totalCommission.toLocaleString()}`, icon: Wallet },
    { label: "Pending Commission", value: `৳${pendingCommission.toLocaleString()}`, icon: DollarSign },
  ];

  const handleCopyLink = (productId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/batch/${productId}?ref=dropshipper`);
    setLinkCopied(productId);
    toast({ title: "Link Copied!", description: "Share this referral link to earn commission." });
    setTimeout(() => setLinkCopied(null), 2000);
  };

  const topProducts = [...(products || [])].sort((a, b) => b.totalSold - a.totalSold).slice(0, 4);

  if (loadingProducts || loadingOrders) {
    return (
      <DashboardLayout role="dropshipper">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="dropshipper">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Dropshipper Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Promote products, generate orders, earn commission</p>
          </div>
          <Link to="/dropshipper/products">
            <Button className="gap-2"><ExternalLink className="w-4 h-4" /> Browse Products</Button>
          </Link>
        </div>

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
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> How You Earn
          </h2>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground text-center">
              No upfront cost. No inventory risk. Promote → Customer orders → Platform ships → You earn.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Top Products</h2>
              <Link to="/dropshipper/products"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="divide-y divide-border/30">
              {topProducts.length === 0 && <div className="p-8 text-center text-muted-foreground">No products available yet.</div>}
              {topProducts.map((product) => (
                <div key={product.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                      {product.image && product.image.startsWith("http") ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-xl">{product.image}</span>
                      )}
                    </div>
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

          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
              <Link to="/dropshipper/orders"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="divide-y divide-border/30">
              {(orders || []).length === 0 && <div className="p-8 text-center text-muted-foreground">No orders yet.</div>}
              {(orders || []).slice(0, 4).map((order: any) => (
                <div key={order.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {order.order_number}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {order.customer_name} · {(order.order_items || []).map((i: any) => i.product_name).join(", ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">৳{Number(order.total_amount).toLocaleString()}</div>
                    <div className="text-xs text-primary font-medium">+৳{Number(order.commission || 0).toLocaleString()}</div>
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
