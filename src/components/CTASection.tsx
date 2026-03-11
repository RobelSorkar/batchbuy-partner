import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, Factory, Package } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="bg-foreground rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(160_60%_38%/0.15),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-background font-display tracking-tight mb-3">
              Start your product business today
            </h2>
            <p className="text-background/60 text-base mb-8 max-w-md mx-auto">
              Join production batches, own real products, and sell through our network.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: Banknote, text: "Start with ৳10,000" },
                { icon: Factory, text: "No factory needed" },
                { icon: Package, text: "No inventory headache" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background/10 text-background/80 text-xs font-medium">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.text}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Become a Partner <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/signup">
              <Button size="lg" variant="outline" className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10">
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
