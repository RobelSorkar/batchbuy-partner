import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Factory, Package, Store, TrendingUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-supply-chain.jpg";

const flowSteps = [
  { icon: Users, label: "People Pool", desc: "Partners co-invest together" },
  { icon: Factory, label: "Factory Production", desc: "Manufacturing begins" },
  { icon: Package, label: "Product Units", desc: "You own real units" },
  { icon: Store, label: "Sellers / Shops / Dropship", desc: "Multi-channel sales" },
  { icon: TrendingUp, label: "Profit", desc: "Earnings & withdrawals" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,11%)]/90 via-[hsl(217,33%,17%)]/75 to-[hsl(215,28%,17%)]/80" />
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 text-sm font-medium animate-fade-in backdrop-blur-sm">
              <Factory className="w-4 h-4" />
              <span>Real products. Real ownership.</span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] mb-6 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <span className="text-primary-foreground">Produce Together.</span>
              <br />
              <span className="text-primary-foreground">Own Products.</span>
              <br />
              <span className="text-primary">Sell Anywhere.</span>
            </h1>

            <p
              className="text-lg text-primary-foreground/60 mb-8 max-w-lg leading-relaxed animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              Join production batches with other partners, own real product units, and sell through dropshippers, shops, or distributors.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Join Production Batch <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="hero-outline" size="lg">
                  Browse Products
                </Button>
              </Link>
            </div>

            <div
              className="flex gap-8 mt-12 animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              {[
                { value: "500+", label: "Partners" },
                { value: "৳2.5Cr", label: "Invested" },
                { value: "50+", label: "Batches" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Supply Chain Flow */}
          <div
            className="hidden lg:block animate-fade-in"
            style={{ animationDelay: "350ms" }}
          >
            <div className="relative bg-[hsl(217,33%,15%)]/70 backdrop-blur-xl border border-[hsl(217,33%,24%)]/50 rounded-2xl p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-6">
                The Journey
              </p>

              <div className="space-y-0">
                {flowSteps.map((step, i) => (
                  <div key={step.label}>
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          i === flowSteps.length - 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-[hsl(217,33%,20%)] text-primary/60 border border-[hsl(217,33%,26%)]"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-primary-foreground">
                          {step.label}
                        </div>
                        <div className="text-xs text-primary-foreground/40 mt-0.5">
                          {step.desc}
                        </div>
                      </div>

                      <span className="text-xs font-mono text-primary-foreground/15">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {i < flowSteps.length - 1 && (
                      <div className="flex items-center gap-4 py-1.5">
                        <div className="w-11 flex justify-center">
                          <ChevronDown className="w-4 h-4 text-primary/25" />
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(217,33%,26%)]/50 to-transparent" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-[hsl(217,33%,24%)]/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { value: "4", label: "Channels" },
                    { value: "30 day", label: "Avg. cycle" },
                    { value: "18-35%", label: "Margins" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="text-lg font-bold text-primary">
                        {m.value}
                      </div>
                      <div className="text-[11px] text-primary-foreground/35">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
