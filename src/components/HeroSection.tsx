import { Button } from "@/components/ui/button";
import { ArrowRight, Factory, Warehouse, Store, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-supply-chain.jpg";

const supplyChainSteps = [
  { icon: Factory, label: "Manufacturing", desc: "Batch production" },
  { icon: Warehouse, label: "Warehousing", desc: "Quality & storage" },
  { icon: Store, label: "Sellers", desc: "Multi-channel sales" },
  { icon: Users, label: "Customers", desc: "Nationwide delivery" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,30%,8%)]/80 via-[hsl(215,35%,12%)]/60 to-[hsl(220,30%,18%)]/70" />
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
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold font-display leading-[1.12] mb-6 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <span className="text-primary-foreground">From factory floor</span>
              <br />
              <span className="text-primary-foreground">to </span>
              <span className="text-primary">customer door.</span>
            </h1>

            <p
              className="text-lg text-primary-foreground/65 mb-8 max-w-lg leading-relaxed animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              Co-invest in real product batches, own units from manufacturing, and sell through retail, dropship, and distribution channels — all on one platform.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Start Business <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="hero-outline" size="lg">
                  Browse Batches
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
                  <div className="text-2xl font-display font-bold text-primary-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/45">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Supply Chain Flow */}
          <div
            className="hidden lg:block animate-fade-in"
            style={{ animationDelay: "350ms" }}
          >
            <div className="relative bg-[hsl(215,25%,12%)]/60 backdrop-blur-xl border border-[hsl(215,20%,25%)]/40 rounded-2xl p-8">
              <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-6">
                How it works
              </p>

              <div className="space-y-0">
                {supplyChainSteps.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-[hsl(215,20%,18%)] text-primary/70 border border-[hsl(215,20%,25%)]"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      {i < supplyChainSteps.length - 1 && (
                        <div className="w-px h-8 bg-gradient-to-b from-primary/40 to-[hsl(215,20%,25%)]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pt-2 pb-4">
                      <div className="text-sm font-display font-semibold text-primary-foreground">
                        {step.label}
                      </div>
                      <div className="text-xs text-primary-foreground/45 mt-0.5">
                        {step.desc}
                      </div>
                    </div>

                    {/* Arrow to next */}
                    {i < supplyChainSteps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-primary/30 mt-3 ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom highlight */}
              <div className="mt-6 pt-5 border-t border-[hsl(215,20%,25%)]/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { value: "4", label: "Channels" },
                    { value: "30 day", label: "Avg. cycle" },
                    { value: "18-35%", label: "Margins" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="text-lg font-display font-bold text-primary">
                        {m.value}
                      </div>
                      <div className="text-[11px] text-primary-foreground/40">{m.label}</div>
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
