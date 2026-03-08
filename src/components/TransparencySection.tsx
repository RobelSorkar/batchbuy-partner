import { Eye, FileText, MapPin, Shield, Clock, BarChart3 } from "lucide-react";

const items = [
  { icon: Eye, title: "Track Every Unit", desc: "See exactly where your products are — from factory floor to customer delivery." },
  { icon: FileText, title: "Verified Invoices", desc: "Every production batch comes with manufacturer invoices and quality reports." },
  { icon: MapPin, title: "Real Warehouses", desc: "Products are stored in verified warehouses with real addresses you can visit." },
  { icon: Shield, title: "Secured Funds", desc: "Your investment is tied to real product units, not promises or abstract tokens." },
  { icon: Clock, title: "Real-Time Updates", desc: "Get live updates on production progress, stock movement, and sales." },
  { icon: BarChart3, title: "Open Financials", desc: "Full transparency on pricing, margins, fees, and profit distribution." },
];

const TransparencySection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Transparency & Trust
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            No hidden fees. No <span className="text-gradient-primary">vague promises</span>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We believe in radical transparency. Every taka invested, every unit produced, and every sale made is fully trackable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-card border border-border/50 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
