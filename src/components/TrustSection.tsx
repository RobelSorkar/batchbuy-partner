import { Package, Eye, Truck, Briefcase } from "lucide-react";

const badges = [
  { icon: Package, label: "Real Products" },
  { icon: Eye, label: "Transparent Inventory" },
  { icon: Truck, label: "Nationwide Distribution" },
  { icon: Briefcase, label: "Real Business" },
];

const stats = [
  { value: "500+", label: "Partners" },
  { value: "৳2.5Cr", label: "Production Value" },
  { value: "50+", label: "Product Batches" },
];

const TrustSection = () => {
  return (
    <section className="py-16 px-6 bg-card border-y border-border">
      <div className="container max-w-5xl mx-auto">
        {/* Credibility badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/60 border border-border/50 text-sm font-medium text-accent-foreground"
            >
              <b.icon className="w-4 h-4" />
              {b.label}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
