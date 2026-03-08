import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Join a Production Batch",
    description: "Browse active batches and invest starting from ৳10,000 BDT. Each batch has limited units available.",
  },
  {
    step: "02",
    title: "Own Your Product Units",
    description: "Once the batch is funded, production begins. You own specific units tracked in your inventory.",
  },
  {
    step: "03",
    title: "Sell Through the Network",
    description: "List products for dropshippers or sell directly. The distribution network handles fulfillment.",
  },
  {
    step: "04",
    title: "Earn & Withdraw",
    description: "Track sales, profits, and commissions in your partner wallet. Withdraw anytime.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-6 bg-muted/40">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From investment to <span className="text-gradient-primary">profit</span> in 4 steps
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-display font-bold text-primary/15 mb-3">{item.step}</div>
              <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-8 -right-4 w-5 h-5 text-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
