import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Factory, Package, Store, TrendingUp, Shield, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/60 via-background to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Inventory Financing Platform — Real Products, Real Ownership
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-foreground mb-6 animate-fade-in"
            style={{ animationDelay: "80ms" }}
          >
            Start Your Product{" "}
            <span className="text-gradient-primary">Business</span>
            <br className="hidden sm:block" />
            {" "}Without a Factory
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            Co-finance production batches, own real product units, and sell
            through multiple channels. Starting from ৳10,000.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-fade-in"
            style={{ animationDelay: "240ms" }}
          >
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                Browse Batches
              </Button>
            </Link>
          </div>

          {/* Trust row */}
          <div
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "320ms" }}
          >
            {[
              { icon: Shield, text: "Verified manufacturers" },
              { icon: Package, text: "Own real products" },
              { icon: CheckCircle2, text: "No factory needed" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flow visual — production pipeline */}
        <div
          className="mt-16 md:mt-20 animate-fade-in"
          style={{ animationDelay: "400ms" }}
        >
          <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card-lg max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                How the production pipeline works
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-0">
              {[
                { icon: Users, label: "Partners Pool", desc: "Co-finance together" },
                { icon: Factory, label: "Factory", desc: "Manufacturing begins" },
                { icon: Package, label: "Products", desc: "You own real units" },
                { icon: Store, label: "Sales Channels", desc: "Multi-channel sales" },
                { icon: TrendingUp, label: "Profit", desc: "Earn & withdraw" },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex-1 text-center px-2">
                    <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                      i === arr.length - 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-semibold text-foreground">{step.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-border shrink-0 hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom stats */}
            <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-4 text-center">
              {[
                { value: "500+", label: "Partners" },
                { value: "৳2.5Cr+", label: "Production financed" },
                { value: "18-35%", label: "Avg. margins" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-lg font-bold text-foreground font-display">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
