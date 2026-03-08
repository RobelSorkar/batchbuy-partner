import { Store, Users, Truck, Globe } from "lucide-react";

const channels = [
  {
    icon: Globe,
    title: "Platform Direct",
    desc: "Sell directly through our marketplace to end customers. Set your own retail price and keep maximum profit.",
    margin: "35-45%",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Store,
    title: "Dropshippers",
    desc: "Enable thousands of social media sellers to sell your products. They handle marketing, you handle inventory.",
    margin: "18-25%",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Users,
    title: "Retail & Shops",
    desc: "Wholesale your units to physical retail stores and online shops at wholesale pricing with bulk discounts.",
    margin: "25-35%",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Truck,
    title: "Distributors",
    desc: "Partner with regional distributors who manage warehousing, last-mile delivery, and local market coverage.",
    margin: "15-22%",
    color: "bg-purple-500/10 text-purple-600",
  },
];

const SalesChannelsSection = () => {
  return (
    <section className="py-24 px-6 bg-muted/40">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Sales Channels
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            Sell through <span className="text-gradient-primary">4 channels</span> simultaneously
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Once you own product units, distribute them through multiple channels to maximize revenue and speed up sales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {channels.map((ch) => (
            <div key={ch.title} className="flex gap-5 p-6 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ch.color}`}>
                <ch.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display font-semibold text-lg">{ch.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                    {ch.margin} margin
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{ch.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesChannelsSection;
