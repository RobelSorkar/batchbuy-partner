import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, LayoutDashboard, Layers, ShoppingCart, Truck, Wallet, Users, LogOut, Menu, Store, Warehouse, ClipboardList, Share2, BarChart3, UserCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "@/components/NotificationDropdown";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: "partner" | "dropshipper" | "admin" | "warehouse" | "distributor";
}

const partnerNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/partner" },
  { icon: Warehouse, label: "Inventory", href: "/partner/inventory" },
  { icon: Layers, label: "Marketplace", href: "/marketplace" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
];

const dropshipperNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/sales-partner" },
  { icon: Store, label: "Products", href: "/sales-partner/products" },
  { icon: ShoppingCart, label: "My Orders", href: "/sales-partner/orders" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
];

const adminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: ClipboardList, label: "Orders", href: "/admin/orders" },
  { icon: Share2, label: "Distribution", href: "/admin/distribution" },
  { icon: Warehouse, label: "Warehouse", href: "/warehouse" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
];

const warehouseNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/warehouse" },
  { icon: ClipboardList, label: "Orders", href: "/warehouse/orders" },
];

const distributorNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/distributor" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
];

const navMap = {
  partner: partnerNav,
  dropshipper: dropshipperNav,
  admin: adminNav,
  warehouse: warehouseNav,
  distributor: distributorNav,
};

const roleLabels = {
  partner: "Production Partner",
  dropshipper: "Sales Partner",
  admin: "Admin",
  warehouse: "Warehouse Manager",
  distributor: "Distributor",
};

const DashboardLayout = ({ children, role = "partner" }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const navItems = navMap[role];

  const activeLabel = navItems.find((item) => location.pathname === item.href)?.label || "Dashboard";

  // Fetch user's roles to determine which switch options to show
  useEffect(() => {
    async function fetchRoles() {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (data) {
        setUserRoles(data.map((r) => r.role));
      }
    }
    fetchRoles();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Determine available switch targets (roles user has that aren't the current one)
  const switchTargets: { role: string; label: string; href: string }[] = [];
  if (role !== "admin" && role !== "warehouse") {
    if (role !== "partner" && userRoles.includes("partner")) {
      switchTargets.push({ role: "partner", label: "Partner", href: "/partner" });
    }
    if (role !== "dropshipper" && userRoles.includes("dropshipper")) {
      switchTargets.push({ role: "dropshipper", label: "Dropshipper", href: "/dropshipper" });
    }
  }

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
          {switchTargets.map((target) => (
            <Link
              key={target.role}
              to={target.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Switch to {target.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
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
            <NotificationDropdown />
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
