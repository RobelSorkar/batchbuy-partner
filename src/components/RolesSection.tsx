import { Button } from "@/components/ui/button";

const roles = [
  {
    title: "Production Partner",
    description: "Invest in batches, own product units, and earn from sales across the network.",
    badge: "Investor",
  },
  {
    title: "Dropshipper / Seller",
    description: "Sell products without inventory. Get access to warehouse-fulfilled products.",
    badge: "Seller",
  },
  {
    title: "Distributor",
    description: "Manage regional distribution, warehousing, and order fulfillment at scale.",
    badge: "Fulfillment",
  },
];

const RolesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            User Roles
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose your <span className="text-gradient-primary">role</span> in the network
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you want to invest, sell, or distribute — there's a place for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className="p-8 rounded-xl bg-card shadow-card hover:shadow-card-hover border border-border/50 transition-all duration-300 flex flex-col"
            >
              <span className="inline-block self-start px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
                {role.badge}
              </span>
              <h3 className="font-display text-xl font-semibold mb-3">{role.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{role.description}</p>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
