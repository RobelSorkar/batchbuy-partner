import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = [
  { value: "partner", label: "Production Partner", desc: "Invest in batches & own units" },
  { value: "dropshipper", label: "Dropshipper / Seller", desc: "Sell products without inventory" },
  { value: "distributor", label: "Distributor", desc: "Handle warehousing & fulfillment" },
];

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("partner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">ProdPartner</span>
            </Link>
            <h1 className="text-2xl font-display font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Start your production partnership journey</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>I want to join as</Label>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedRole === role.value
                        ? "border-primary bg-accent ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="text-sm font-medium">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Link to="/partner">
              <Button className="w-full mt-2" size="lg">
                Create Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:flex flex-1 bg-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-primary-foreground mb-3">
            Join the Network
          </h2>
          <p className="text-primary-foreground/60 leading-relaxed">
            Whether you invest, sell, or distribute — start earning from real product sales today with a minimum of ৳10,000 BDT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
