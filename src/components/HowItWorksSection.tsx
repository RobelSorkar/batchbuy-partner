import { Factory, Package, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Factory,
    step: "01",
    title: "Join a Production Project",
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
    <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <p className="text-xs sm:text-sm font-medium text-primary mb-2 sm:mb-3">How It Works</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight mb-3 sm:mb-4">
            Three steps to your first batch
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            From financing to profit — a clear and transparent process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((item) => (
            <div key={item.step} className="relative text-center">
              {/* Step circle */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4 sm:mb-5 relative z-10">
                <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>

              <div className="text-[10px] sm:text-xs font-mono text-muted-foreground mb-1.5 sm:mb-2">{item.step}</div>
              <h3 className="text-base sm:text-lg font-semibold font-display mb-1.5 sm:mb-2 tracking-tight">{item.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
