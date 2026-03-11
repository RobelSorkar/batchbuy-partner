import { Button } from "@/components/ui/button";
import { Factory, Store, Truck, Warehouse, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Factory,
    title: "Production Partner",
    description: "Finance real product batches. Own manufactured units. Earn when they sell.",
    badge: "Financing",
    earnings: "18-45% margins",
  },
  {
    icon: Store,
    title: "Sales Partner",
    description: "Sell products without inventory. We ship for you. Earn commission per sale.",
    badge: "Commission",
    earnings: "৳50-200 / sale",
  },
  {
    icon: Truck,
    title: "Distributor",
    description: "Buy wholesale, serve your local market. Handle last-mile delivery.",
    badge: "Wholesale",
    earnings: "15-22% margin",
  },
  {
    icon: Warehouse,
    title: "Warehouse Partner",
    description: "Provide storage & fulfillment services. Earn per-order processing fees.",
    badge: "Fulfillment",
    earnings: "Per-order fees",
  },
];

const RolesSection = () => {
  return (
    <section className="py-20 md:py-28 px-6 bg-muted/30">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary mb-3">Partner Roles</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
            Choose your role in the supply chain
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether you finance, sell, distribute, or warehouse — there's a role for you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className="p-5 rounded-xl border border-border bg-card flex flex-col hover:shadow-card-hover transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                <role.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-[10px] font-medium text-primary uppercase tracking-wider mb-2">{role.badge}</div>
              <h3 className="font-semibold text-base mb-1.5 tracking-tight">{role.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{role.description}</p>
              <div className="text-sm font-semibold text-primary mb-4">{role.earnings}</div>
              <Link to="/signup">
                <Button variant="outline" className="w-full" size="sm">
                  Get Started <ArrowRight className="w-3 h-3 ml-1" />
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
