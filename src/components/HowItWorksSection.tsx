import { Factory, Package, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Factory,
    step: "1",
    title: "Join Production Batch",
    description: "Finance a product batch with other partners.",
  },
  {
    icon: Package,
    step: "2",
    title: "Own Product Units",
    description: "Receive ownership of production units.",
  },
  {
    icon: TrendingUp,
    step: "3",
    title: "Sell & Earn Profit",
    description: "Sell yourself or through the platform network.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-6 bg-muted/40">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display">
            3 simple steps to <span className="text-gradient-primary">start earning</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-14 left-[33%] w-[10%] h-px bg-primary/20" />
          <div className="hidden md:block absolute top-14 right-[33%] w-[10%] h-px bg-primary/20" />
          <div className="hidden md:block absolute top-[52px] left-[calc(33%-4px)]">
            <ArrowRight className="w-4 h-4 text-primary/30" />
          </div>
          <div className="hidden md:block absolute top-[52px] right-[calc(33%-4px)]">
            <ArrowRight className="w-4 h-4 text-primary/30" />
          </div>

          {steps.map((item) => (
            <div
              key={item.step}
              className="relative bg-card border border-border/50 rounded-2xl p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-display">
                {item.step}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mt-2 mb-5">
                <item.icon className="w-7 h-7 text-accent-foreground" />
              </div>

              <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
