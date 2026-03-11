import { Warehouse, BarChart3, ShieldCheck, Wallet, Play, Camera, Factory } from "lucide-react";
import warehouseImg from "@/assets/proof/warehouse-interior.jpg";
import factoryImg from "@/assets/proof/factory-floor.jpg";
import productionImg from "@/assets/proof/production-line.jpg";
import { useState } from "react";

const items = [
  { icon: Warehouse, title: "Real Warehouse Inventory", desc: "Products stored in verified warehouses. Track stock in real-time." },
  { icon: BarChart3, title: "Transparent Profit Tracking", desc: "See every sale, commission, and expense breakdown." },
  { icon: ShieldCheck, title: "Verified Manufacturers", desc: "Trade licenses, factory addresses, production history — all verified." },
  { icon: Wallet, title: "Secure Wallet", desc: "Withdraw via bKash, Nagad, or Rocket. Every transaction logged." },
];

const proofGallery = [
  { image: warehouseImg, label: "Warehouse", tag: "LIVE", icon: Camera, desc: "Dhaka warehouse — real-time tracking" },
  { image: factoryImg, label: "Factory Floor", tag: "VERIFIED", icon: Factory, desc: "Quality controlled manufacturing" },
  { image: productionImg, label: "Production Line", tag: "VIDEO", icon: Play, desc: "Assembly & quality check" },
];

const TransparencySection = () => {
  const [activeProof, setActiveProof] = useState(0);

  return (
    <section className="py-20 md:py-28 px-6 bg-muted/30">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary mb-3">Trust & Transparency</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
            Everything is trackable
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No hidden fees. Every taka and every product unit is fully transparent.
          </p>
        </div>

        {/* Gallery */}
        <div className="mb-12">
          <div className="grid md:grid-cols-5 gap-3">
            <div className="md:col-span-3 relative group rounded-xl overflow-hidden aspect-[4/3] bg-muted">
              <img
                src={proofGallery[activeProof].image}
                alt={proofGallery[activeProof].label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider">
                  {proofGallery[activeProof].tag === "LIVE" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-foreground mr-1 animate-pulse" />
                  )}
                  {proofGallery[activeProof].tag}
                </span>
              </div>

              {proofGallery[activeProof].tag === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3">
                <p className="text-sm font-semibold text-primary-foreground">{proofGallery[activeProof].label}</p>
                <p className="text-xs text-primary-foreground/70">{proofGallery[activeProof].desc}</p>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-3 md:grid-cols-1 gap-2">
              {proofGallery.map((proof, i) => (
                <button
                  key={proof.label}
                  onClick={() => setActiveProof(i)}
                  className={`relative rounded-lg overflow-hidden aspect-[4/3] md:aspect-[16/7] transition-all group ${
                    activeProof === i
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={proof.image} alt={proof.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-foreground/30" />
                  <div className="absolute bottom-1.5 left-2">
                    <span className="text-[10px] font-medium text-primary-foreground">{proof.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-0.5">{item.title}</h3>
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
