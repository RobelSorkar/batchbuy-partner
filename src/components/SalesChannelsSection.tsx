import { Globe, Store, ShoppingBag, Truck } from "lucide-react";

const channels = [
  {
    icon: ShoppingBag,
    title: "Sales Partners",
    desc: "Zero inventory. Take orders, we ship directly to customers.",
    tag: "Commission based",
  },
  {
    icon: Store,
    title: "Retail Shops",
    desc: "Buy at wholesale price, sell at retail in physical stores.",
    tag: "Wholesale pricing",
  },
  {
    icon: Globe,
    title: "Online Sellers",
    desc: "Sell on Facebook, websites, social platforms. We fulfill.",
    tag: "Fulfilled by us",
  },
  {
    icon: Truck,
    title: "Distributors",
    desc: "Buy in bulk, handle local market delivery and distribution.",
    tag: "Bulk orders",
  },
];

const SalesChannelsSection = () => {
  return (
    <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-medium text-primary mb-2 sm:mb-3">Sales Channels</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight mb-3 sm:mb-4">
            Your products, sold everywhere
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Products reach customers through multiple channels simultaneously.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {channels.map((ch) => (
            <div
              key={ch.title}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <ch.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{ch.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{ch.tag}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{ch.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesChannelsSection;
