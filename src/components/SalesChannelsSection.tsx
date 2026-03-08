import { Globe, Store, ShoppingBag, Truck, Warehouse, ArrowRight } from "lucide-react";

const channels = [
  {
    icon: Globe,
    title: "Online Sellers",
    desc: "Sell on Facebook, websites, and social platforms. We fulfill orders from warehouse.",
  },
  {
    icon: Store,
    title: "Retail Shops",
    desc: "Wholesale to physical stores. They buy at wholesale price and sell at retail.",
  },
  {
    icon: ShoppingBag,
    title: "Dropshippers",
    desc: "Zero inventory sellers. They take orders, we ship directly to customers.",
  },
  {
    icon: Truck,
    title: "Distributors",
    desc: "Regional partners who buy in bulk and handle local market delivery.",
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
            Your products, <span className="text-gradient-primary">sold everywhere</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Products go from warehouse to customers through multiple sales channels simultaneously.
          </p>
        </div>

        {/* Warehouse → Channels visual */}
        <div className="flex flex-col items-center mb-12">
          {/* Warehouse hub */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-border shadow-card">
            <Warehouse className="w-6 h-6 text-primary" />
            <span className="font-display font-semibold text-lg">Warehouse</span>
          </div>

          {/* Connector lines */}
          <div className="relative w-full max-w-2xl h-12 mt-1">
            {/* Center vertical line */}
            <div className="absolute left-1/2 top-0 w-px h-4 bg-primary/30" />
            {/* Horizontal spread */}
            <div className="absolute top-4 left-[12.5%] right-[12.5%] h-px bg-primary/20" />
            {/* 4 drop lines */}
            {[12.5, 37.5, 62.5, 87.5].map((pos) => (
              <div
                key={pos}
                className="absolute h-4 w-px bg-primary/30"
                style={{ left: `${pos}%`, top: "16px" }}
              />
            ))}
            {/* 4 arrows */}
            {[12.5, 37.5, 62.5, 87.5].map((pos) => (
              <div
                key={`arrow-${pos}`}
                className="absolute"
                style={{ left: `calc(${pos}% - 6px)`, top: "28px" }}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" className="text-primary/40">
                  <path d="M6 8L0 0h12z" fill="currentColor" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Channel cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((ch) => (
            <div
              key={ch.title}
              className="bg-card border border-border/50 rounded-xl p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <ch.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{ch.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{ch.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesChannelsSection;
