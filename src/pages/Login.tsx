import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      // Redirect based on role (admin takes highest priority)
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user?.id);
      const roleList = (roles || []).map((r) => r.role);
      if (roleList.includes("admin")) navigate("/admin");
      else if (roleList.includes("warehouse")) navigate("/warehouse");
      else if (roleList.includes("distributor")) navigate("/distributor");
      else if (roleList.includes("dropshipper")) navigate("/sales-partner");
      else navigate("/partner");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">ProdPartner</span>
            </Link>
            <h1 className="text-2xl font-display font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full mt-2" size="lg" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-primary-foreground mb-3">Inventory Financing Platform</h2>
          <p className="text-primary-foreground/60 leading-relaxed">Finance production batches, own product units, and sell through a powerful distribution network. Start with just ৳10,000 BDT.</p>
          <div className="flex justify-center gap-6 mt-8">
            {[{ value: "500+", label: "Partners" }, { value: "৳2.5Cr", label: "Financed" }, { value: "98%", label: "Satisfaction" }].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-display font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-primary-foreground/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
