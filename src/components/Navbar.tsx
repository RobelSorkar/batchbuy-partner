import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dashboardPath, setDashboardPath] = useState("/partner");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from("user_roles").select("role").eq("user_id", data.user.id).then(({ data: roles }) => {
          const roleList = (roles || []).map((r) => r.role);
          if (roleList.includes("admin")) setDashboardPath("/admin");
          else if (roleList.includes("warehouse")) setDashboardPath("/warehouse");
          else if (roleList.includes("distributor")) setDashboardPath("/distributor");
          else if (roleList.includes("dropshipper")) setDashboardPath("/sales-partner");
          else setDashboardPath("/partner");
        });
      }
    });
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">ProdPartner</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "Batches", href: "#batches" },
            { label: "Roles", href: "#roles" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/transparency"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            Transparency
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link to={dashboardPath}>
              <Button size="sm" className="h-8 text-xs gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-8 text-xs">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="h-8 text-xs">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-1">
          <a href="#how-it-works" className="block px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-muted">How It Works</a>
          <a href="#batches" className="block px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-muted">Batches</a>
          <a href="#roles" className="block px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-muted">Roles</a>
          <Link to="/transparency" className="block px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-muted" onClick={() => setMobileOpen(false)}>Transparency</Link>
          <div className="pt-2 border-t border-border mt-2">
            {user ? (
              <Link to={dashboardPath}><Button className="w-full" size="sm"><LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Dashboard</Button></Link>
            ) : (
              <div className="space-y-2">
                <Link to="/signup"><Button className="w-full" size="sm">Get Started</Button></Link>
                <Link to="/login"><Button variant="outline" className="w-full" size="sm">Log In</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
