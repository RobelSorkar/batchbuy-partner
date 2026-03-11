import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, Factory, Package } from "lucide-react";
import { Link } from "react-router-dom";

const objections = [
  { icon: Banknote, text: "Start with only ৳10,000" },
  { icon: Factory, text: "No factory needed" },
  { icon: Package, text: "No inventory headache" },
];

const CTASection = () => {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-hero rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(160_60%_38%/0.12),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-primary-foreground mb-4 font-display">
              Start Your Product Business Today
            </h2>
            <p className="text-primary-foreground/60 text-lg mb-8 max-w-xl mx-auto">
              Join production batches, own real products, and sell through our nationwide network.
            </p>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
              {objections.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-foreground/8 border border-primary-foreground/12 backdrop-blur-sm"
                >
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-primary-foreground whitespace-nowrap">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Become Production Partner <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero-outline" size="lg">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
