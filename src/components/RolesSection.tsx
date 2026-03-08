import { Button } from "@/components/ui/button";
import { Factory, Store, Truck, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Factory,
    title: "Production Partner",
    description: "Finance real product batches. Own manufactured units and earn profit when they sell through the network.",
    badge: "Financing Partner",
    earnings: "18-45% margins",
    link: "/signup",
  },
  {
    icon: Store,
    title: "Dropshipper / Seller",
    description: "Sell products without holding inventory. Access warehouse-fulfilled products and earn commission on every order.",
    badge: "Seller",
    earnings: "৳50-200 per sale",
    link: "/signup",
  },
  {
    icon: Truck,
    title: "Distributor",
    description: "Manage regional distribution. Buy at wholesale price, handle last-mile delivery, and serve your local market.",
    badge: "Wholesale",
    earnings: "15-22% margin",
    link: "/signup",
  },
  {
    icon: Warehouse,
    title: "Warehouse Partner",
    description: "Provide storage and fulfillment services. Earn per-order fees for receiving, storing, and shipping products.",
    badge: "Fulfillment",
    earnings: "Per-order fees",
    link: "/signup",
  },
];

const RolesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Partner Roles
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            Choose your <span className="text-gradient-primary">role</span> in the supply chain
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you want to invest in production, sell products, distribute wholesale, or provide warehousing — there's a place for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className="p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover border border-border/50 transition-all duration-300 flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4">
                <role.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="inline-block self-start px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                {role.badge}
              </span>
              <h3 className="font-display text-lg font-semibold mb-2">{role.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{role.description}</p>
              <div className="text-xs font-medium text-accent-foreground bg-accent rounded-lg px-3 py-1.5 text-center mb-4">
                {role.earnings}
              </div>
              <Link to={role.link}>
                <Button variant="outline" className="w-full" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
