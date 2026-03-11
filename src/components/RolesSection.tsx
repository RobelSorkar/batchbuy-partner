import { Button } from "@/components/ui/button";
import { Factory, Store, Truck, Warehouse, ArrowRight } from "lucide-react";
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
    title: "Sales Partner",
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
    <section className="section-padding">
      <div className="container max-w-6xl mx-auto">
        <div className="section-header">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-medium mb-5">
            Partner Roles
          </span>
          <h2 className="font-display mb-3">
            Choose your <span className="text-gradient-primary">role</span> in the supply chain
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you want to finance production, sell products, distribute wholesale, or provide warehousing — there's a place for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role) => (
            <div
              key={role.title}
              className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover border border-border/50 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                <role.icon className="w-5.5 h-5.5 text-primary" />
              </div>
              <span className="inline-block self-start px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-3 border border-primary/10">
                {role.badge}
              </span>
              <h3 className="font-display font-semibold text-lg mb-2">{role.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{role.description}</p>
              <div className="text-xs font-semibold text-primary bg-primary/8 border border-primary/10 rounded-lg px-3 py-2 text-center mb-4">
                {role.earnings}
              </div>
              <Link to={role.link}>
                <Button variant="outline" className="w-full gap-1" size="sm">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
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
