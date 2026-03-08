import DashboardLayout from "@/components/DashboardLayout";
import { ShoppingCart, TrendingUp, Package, Wallet, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Sales", value: "৳87,600", change: "+18%", up: true, icon: TrendingUp },
  { label: "Orders This Month", value: "34", change: "+8", up: true, icon: ShoppingCart },
  { label: "Products Listed", value: "12", change: "+2", up: true, icon: Package },
  { label: "Commission Earned", value: "৳12,340", change: "+৳3,100", up: true, icon: Wallet },
];

const activeProducts = [
  { name: "Premium Cotton T-Shirt (White)", price: 650, sold: 28, stock: 50, margin: "৳200/unit" },
  { name: "Organic Skincare Set", price: 1200, sold: 15, stock: 30, margin: "৳350/unit" },
  { name: "Bamboo Kitchen Utensils", price: 520, sold: 42, stock: 80, margin: "৳170/unit" },
  { name: "Leather Wallet (Brown)", price: 1800, sold: 8, stock: 20, margin: "৳600/unit" },
];

const recentOrders = [
  { id: "#ORD-2847", customer: "Rahim Ahmed", product: "Cotton T-Shirt", amount: "৳1,300", status: "Shipped" },
  { id: "#ORD-2846", customer: "Fatima Khatun", product: "Skincare Set", amount: "৳1,200", status: "Processing" },
  { id: "#ORD-2845", customer: "Kamal Hossain", product: "Bamboo Utensils", amount: "৳1,040", status: "Delivered" },
  { id: "#ORD-2844", customer: "Nasrin Begum", product: "Leather Wallet", amount: "৳1,800", status: "Shipped" },
];

const statusColors: Record<string, string> = {
  Shipped: "bg-accent text-accent-foreground",
  Processing: "bg-secondary text-secondary-foreground",
  Delivered: "bg-primary/10 text-primary",
};

const DropshipperDashboard = () => {
  return (
    <DashboardLayout role="dropshipper">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Dropshipper Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your sales and orders</p>
          </div>
          <Link to="/marketplace">
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Products */}
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Active Products</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="divide-y divide-border/30">
              {activeProducts.map((product) => (
                <div key={product.name} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ৳{product.price} · {product.sold} sold · {product.stock} in stock
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{product.margin}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="divide-y divide-border/30">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {order.id}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {order.customer} · {order.product}
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{order.amount}</span>
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
