import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-hero rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(160_60%_38%/0.12),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
              Ready to own real products and earn real profit?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
              Join active production batches starting from ৳10,000 BDT. Own product units, sell through multiple channels, and track every taka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Start Your Business <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="hero-outline" size="lg">
                  Browse Production Batches
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
