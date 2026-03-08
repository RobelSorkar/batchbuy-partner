import { Factory, Package, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Factory,
    step: "01",
    title: "Join a Production Batch",
    description: "Browse active product batches from verified manufacturers. Invest starting from ৳10,000 BDT to co-fund real production runs.",
    highlight: "Real factories, real products",
  },
  {
    icon: Package,
    step: "02",
    title: "Own Your Product Units",
    description: "Once the batch is funded, production begins. You own specific product units stored in verified warehouses, tracked in your inventory.",
    highlight: "Your name, your units",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Sell & Earn Profit",
    description: "Sell through dropshippers, retail shops, distributors, or the platform marketplace. Track every sale and withdraw earnings anytime.",
    highlight: "Multiple channels, maximum reach",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            From investment to <span className="text-gradient-primary">profit</span> in 3 simple steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No complicated processes. Join a batch, own products, sell them, and earn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/10" />
              )}

              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-7 h-7 text-primary" />
              </div>

              <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
                Step {item.step}
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">{item.description}</p>
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                {item.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
