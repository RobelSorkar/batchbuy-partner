import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-primary/20 text-primary mb-6 text-sm font-medium animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            <span>৳10,000 BDT minimum entry</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="text-primary-foreground">Own production.</span>
            <br />
            <span className="text-gradient-primary">Sell everywhere.</span>
          </h1>

          <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: "200ms" }}>
            Join limited production batches, own real product units, and sell through a powerful distribution network. Your production partnership starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link to="/dashboard">
              <Button variant="hero" size="lg">
                Start Investing <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="lg">
              Watch Demo
            </Button>
          </div>

          <div className="flex gap-8 mt-12 animate-fade-in" style={{ animationDelay: "400ms" }}>
            {[
              { value: "500+", label: "Partners" },
              { value: "৳2.5Cr", label: "Invested" },
              { value: "50+", label: "Batches" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-display font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
