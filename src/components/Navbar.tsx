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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm" 
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">ProdPartner</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Roles", href: "#roles" },
          ].map((item) => (
            <a 
              key={item.label}
              href={item.href} 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {item.label}
            </a>
          ))}
          <Link 
            to="/transparency" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
          >
            Transparency
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link to={dashboardPath}>
              <Button size="sm" className="gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-5 space-y-1">
          <a href="#features" className="block px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted/50">Features</a>
          <a href="#how-it-works" className="block px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted/50">How It Works</a>
          <a href="#roles" className="block px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted/50">Roles</a>
          <Link to="/transparency" className="block px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted/50" onClick={() => setMobileOpen(false)}>Transparency</Link>
          <div className="pt-3 border-t border-border/50">
            {user ? (
              <Link to={dashboardPath}><Button className="w-full" size="sm"><LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Dashboard</Button></Link>
            ) : (
              <div className="space-y-2">
                <Link to="/signup"><Button className="w-full" size="sm">Get Started Free</Button></Link>
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
