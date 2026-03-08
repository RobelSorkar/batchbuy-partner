import { Warehouse, BarChart3, ShieldCheck, Wallet } from "lucide-react";

const items = [
  {
    icon: Warehouse,
    title: "Real Warehouse Inventory",
    desc: "Every product unit is stored in verified warehouses with real addresses. Track stock in real-time.",
  },
  {
    icon: BarChart3,
    title: "Transparent Profit Tracking",
    desc: "See every sale, commission, and expense. Full breakdown of how your profit is calculated.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Production Partners",
    desc: "All manufacturers are verified with trade licenses, factory addresses, and production history.",
  },
  {
    icon: Wallet,
    title: "Secure Wallet System",
    desc: "Withdraw earnings via bKash, Nagad, or Rocket. Every transaction is logged and trackable.",
  },
];

const TransparencySection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Trust & Transparency
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            Everything is <span className="text-gradient-primary">trackable</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No hidden fees. No vague promises. Every taka and every product unit is fully transparent.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-6 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
