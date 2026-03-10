import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dashboardPath, setDashboardPath] = useState("/partner");

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">ProdPartner</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roles</a>
          <Link to="/transparency" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Transparency</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
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
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm text-muted-foreground">Features</a>
          <a href="#how-it-works" className="block text-sm text-muted-foreground">How It Works</a>
          <a href="#roles" className="block text-sm text-muted-foreground">Roles</a>
          {user ? (
            <Link to={dashboardPath}><Button className="w-full mt-2" size="sm"><LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Dashboard</Button></Link>
          ) : (
            <Link to="/signup"><Button className="w-full mt-2" size="sm">Get Started</Button></Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
