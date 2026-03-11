import { Factory, Package, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Factory,
    step: "01",
    title: "Join a Production Batch",
    description: "Choose a product and co-finance manufacturing with other partners. Min ৳10,000.",
  },
  {
    icon: Package,
    step: "02",
    title: "Own Product Units",
    description: "Receive ownership of real manufactured units. Track your inventory in real-time.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Sell & Earn Profit",
    description: "Sell through the platform network or collect products yourself. Withdraw profits anytime.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
            Three steps to your first batch
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            From financing to profit — a clear and transparent process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((item) => (
            <div key={item.step} className="relative text-center">
              {/* Step circle */}
              <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-5 relative z-10">
                <item.icon className="w-8 h-8 text-primary" />
              </div>

              <div className="text-xs font-mono text-muted-foreground mb-2">{item.step}</div>
              <h3 className="text-lg font-semibold font-display mb-2 tracking-tight">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
