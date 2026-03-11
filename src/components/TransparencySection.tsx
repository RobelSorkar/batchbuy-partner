import { Warehouse, BarChart3, ShieldCheck, Wallet, Play, Camera, Factory } from "lucide-react";
import warehouseImg from "@/assets/proof/warehouse-interior.jpg";
import factoryImg from "@/assets/proof/factory-floor.jpg";
import productionImg from "@/assets/proof/production-line.jpg";
import { useState } from "react";

const items = [
  {
    icon: Warehouse,
    title: "Real Warehouse Inventory",
    desc: "Every product unit is stored in verified warehouses with real addresses. Track stock in real-time.",
  },
  {
    icon: BarChart3,
    title: "Transparent Profit Tracking",
    desc: "See every sale, commission, and expense. Full breakdown of how your profit is calculated.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Production Partners",
    desc: "All manufacturers are verified with trade licenses, factory addresses, and production history.",
  },
  {
    icon: Wallet,
    title: "Secure Wallet System",
    desc: "Withdraw earnings via bKash, Nagad, or Rocket. Every transaction is logged and trackable.",
  },
];

const proofGallery = [
  {
    image: warehouseImg,
    label: "Warehouse Storage",
    tag: "LIVE",
    icon: Camera,
    desc: "Dhaka warehouse — real-time inventory tracking",
  },
  {
    image: factoryImg,
    label: "Factory Production",
    tag: "VERIFIED",
    icon: Factory,
    desc: "Partner factory floor — quality controlled manufacturing",
  },
  {
    image: productionImg,
    label: "Production Line",
    tag: "VIDEO",
    icon: Play,
    desc: "Product assembly & quality check process",
  },
];

const TransparencySection = () => {
  const [activeProof, setActiveProof] = useState(0);

  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Trust & Transparency
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            Everything is <span className="text-gradient-primary">trackable</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No hidden fees. No vague promises. Every taka and every product unit is fully transparent.
          </p>
        </div>

        {/* Visual Proof Gallery */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Visual Proof</h3>
            <span className="ml-auto text-xs text-muted-foreground">Real photos from our operations</span>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {/* Main large image */}
            <div className="md:col-span-3 relative group rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
              <img
                src={proofGallery[activeProof].image}
                alt={proofGallery[activeProof].label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              
              {/* Tag badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  proofGallery[activeProof].tag === "LIVE" 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : proofGallery[activeProof].tag === "VIDEO"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}>
                  {proofGallery[activeProof].tag === "LIVE" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                  )}
                  {proofGallery[activeProof].tag}
                </span>
              </div>

              {/* Play button for video */}
              {proofGallery[activeProof].tag === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary transition-colors">
                    <Play className="w-7 h-7 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}

              {/* Bottom info */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-sm font-semibold text-foreground">{proofGallery[activeProof].label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{proofGallery[activeProof].desc}</p>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="md:col-span-2 grid grid-cols-3 md:grid-cols-1 gap-3">
              {proofGallery.map((proof, i) => (
                <button
                  key={proof.label}
                  onClick={() => setActiveProof(i)}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] md:aspect-[16/7] transition-all duration-300 group ${
                    activeProof === i 
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={proof.image}
                    alt={proof.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                  <div className="absolute bottom-2 left-2">
                    <div className="flex items-center gap-1.5">
                      <proof.icon className="w-3 h-3 text-primary" />
                      <span className="text-[11px] font-medium text-foreground">{proof.label}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-6 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
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
