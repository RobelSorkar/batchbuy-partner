import { Factory, Users, Package, TrendingUp, ShieldCheck, Truck } from "lucide-react";

const stats = [
  { icon: Factory, value: "50+", label: "Production Batches", desc: "Completed & running" },
  { icon: Users, value: "500+", label: "Active Partners", desc: "Business owners" },
  { icon: Package, value: "25,000+", label: "Units Produced", desc: "Real products manufactured" },
  { icon: TrendingUp, value: "৳2.5Cr+", label: "Total Invested", desc: "By verified partners" },
  { icon: Truck, value: "12+", label: "Warehouses", desc: "Nationwide fulfillment" },
  { icon: ShieldCheck, value: "100%", label: "Transparent", desc: "Track every unit & taka" },
];

const TrustSection = () => {
  return (
    <section className="py-20 px-6 bg-card border-y border-border">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Trusted by Real Businesses
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            Built on <span className="text-gradient-primary">real production</span>, not promises
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every number here represents real products manufactured, real partners earning, and real customers served across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-background border border-border/50 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mt-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
