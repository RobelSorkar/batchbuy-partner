import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, LayoutDashboard, Layers, ShoppingCart, Truck, Wallet, Users, Settings, LogOut, Menu, Bell, Store, ShieldCheck, Warehouse } from "lucide-react";
import { NavLink } from "@/components/NavLink";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: "partner" | "dropshipper" | "admin" | "warehouse";
}

const partnerNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/partner" },
  { icon: Layers, label: "My Batches", href: "/partner/batches" },
  { icon: Package, label: "Inventory", href: "/partner/inventory" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Settings, label: "Settings", href: "/partner/settings" },
];

const dropshipperNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/dropshipper" },
  { icon: Store, label: "Marketplace", href: "/marketplace" },
  { icon: ShoppingCart, label: "My Orders", href: "/dropshipper/orders" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Settings, label: "Settings", href: "/dropshipper/settings" },
];

const adminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Layers, label: "All Batches", href: "/admin/batches" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Warehouse, label: "Warehouse", href: "/warehouse" },
  { icon: Truck, label: "Fulfillment", href: "/admin/fulfillment" },
  { icon: Wallet, label: "Wallets", href: "/admin/wallets" },
  { icon: ShieldCheck, label: "Moderation", href: "/admin/moderation" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const warehouseNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/warehouse" },
  { icon: Package, label: "Inventory", href: "/warehouse/inventory" },
  { icon: ShoppingCart, label: "Orders", href: "/warehouse/orders" },
  { icon: Truck, label: "Fulfillment", href: "/warehouse/fulfillment" },
  { icon: Settings, label: "Settings", href: "/warehouse/settings" },
];

const navMap = {
  partner: partnerNav,
  dropshipper: dropshipperNav,
  admin: adminNav,
  warehouse: warehouseNav,
};

const roleLabels = {
  partner: "Production Partner",
  dropshipper: "Dropshipper",
  admin: "Admin",
  warehouse: "Warehouse Manager",
};

const DashboardLayout = ({ children, role = "partner" }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navItems = navMap[role];

  const activeLabel = navItems.find((item) => location.pathname === item.href)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 h-16 px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Package className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground">ProdPartner</span>
          </Link>
        </div>

        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            {roleLabels[role]}
          </span>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-primary"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          {role !== "admin" && role !== "warehouse" && (
            <Link
              to={role === "partner" ? "/dropshipper" : "/partner"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Switch to {role === "partner" ? "Dropshipper" : "Partner"}
            </Link>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-display font-semibold text-lg">{activeLabel}</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {role === "admin" ? "A" : role === "partner" ? "P" : role === "warehouse" ? "W" : "D"}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
