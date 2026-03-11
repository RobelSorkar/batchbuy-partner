import { Package, Users, Truck, Wallet, ArrowRight, ShieldCheck, BarChart3, Globe } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Production Projects",
    description: "Join limited production projects with a minimum of ৳10,000 BDT. Own real product units from verified manufacturers.",
  },
  {
    icon: Users,
    title: "Partner Network",
    description: "Connect with production partners, sales partners, and distributors in a unified marketplace ecosystem.",
  },
  {
    icon: Truck,
    title: "Warehouse Fulfillment",
    description: "Products stored and shipped from verified warehouses. Seamless order fulfillment for every sale.",
  },
  {
    icon: Wallet,
    title: "Partner Wallets",
    description: "Track earnings, financing, and payouts in real-time. Transparent financial management for all partners.",
  },
  {
    icon: ShieldCheck,
    title: "Inventory Ownership",
    description: "Full ownership tracking of your product units. Know exactly what you own and where it is.",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Monitor your sales performance, project profitability, and distribution metrics with detailed analytics.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to <span className="text-gradient-primary">scale production</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From project participation to product fulfillment — manage your entire production partnership in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow duration-300">
                <feature.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
