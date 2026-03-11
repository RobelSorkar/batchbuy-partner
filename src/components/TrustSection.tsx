import { Package, Shield, Truck, Factory } from "lucide-react";

const badges = [
  { icon: Shield, label: "Verified Manufacturers", value: "15+" },
  { icon: Package, label: "Products Produced", value: "12,000+" },
  { icon: Factory, label: "Factory Partners", value: "8" },
  { icon: Truck, label: "Distribution Network", value: "Nationwide" },
];

const TrustSection = () => {
  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b) => (
            <div
              key={b.label}
              className="text-center p-5 rounded-xl border border-border bg-card"
            >
              <b.icon className="w-5 h-5 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold font-display text-foreground mb-1">{b.value}</div>
              <div className="text-xs text-muted-foreground">{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
