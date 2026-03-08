import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, Users, Package, Truck, MapPin, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const batchData: Record<string, {
  name: string; category: string; status: string; unitPrice: number;
  totalUnits: number; fundedUnits: number; minInvestment: number;
  returnEstimate: string; deadline: string; image: string; description: string;
  manufacturer: string; warehouse: string; productionTime: string; partners: number;
}> = {
  "1": {
    name: "Premium Cotton T-Shirts — Batch #47", category: "Apparel", status: "Funding",
    unitPrice: 450, totalUnits: 500, fundedUnits: 312, minInvestment: 10000,
    returnEstimate: "18-22%", deadline: "12 days left", image: "👕",
    description: "High-quality 100% organic cotton t-shirts manufactured in Dhaka. Available in 5 colors and sizes S-XXL. Each unit includes packaging and labeling ready for retail.",
    manufacturer: "Dhaka Textile Mills Ltd.", warehouse: "Gazipur Central Warehouse",
    productionTime: "21 days", partners: 45,
  },
  "2": {
    name: "Organic Skincare Set — Batch #23", category: "Beauty", status: "Funding",
    unitPrice: 850, totalUnits: 300, fundedUnits: 198, minInvestment: 10000,
    returnEstimate: "20-25%", deadline: "8 days left", image: "🧴",
    description: "A curated set of organic skincare products including cleanser, toner, and moisturizer. Dermatologically tested and eco-friendly packaging.",
    manufacturer: "NatureCare BD", warehouse: "Chattogram Distribution Hub",
    productionTime: "14 days", partners: 32,
  },
};

const BatchDetail = () => {
  const { id } = useParams();
  const batch = batchData[id || "1"] || batchData["1"];
  const progress = Math.round((batch.fundedUnits / batch.totalUnits) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-6">
        <div className="container max-w-5xl mx-auto">
          {/* Back */}
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className="h-64 bg-muted/50 rounded-xl flex items-center justify-center text-7xl">
                {batch.image}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                    {batch.status}
                  </span>
                  <span className="text-sm text-muted-foreground">{batch.category}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold mb-4">{batch.name}</h1>
                <p className="text-muted-foreground leading-relaxed">{batch.description}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: MapPin, label: "Manufacturer", value: batch.manufacturer },
                  { icon: Truck, label: "Warehouse", value: batch.warehouse },
                  { icon: Calendar, label: "Production Time", value: batch.productionTime },
                  { icon: Users, label: "Partners Joined", value: `${batch.partners} partners` },
                ].map((item) => (
                  <div key={item.label} className="bg-card rounded-lg p-4 border border-border/50 shadow-card">
                    <item.icon className="w-4 h-4 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-sm font-medium leading-tight">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Trust signals */}
              <div className="bg-accent/50 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Verified Production</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Manufacturer verified and audited</li>
                  <li>✓ Product samples approved</li>
                  <li>✓ Warehouse fulfillment guaranteed</li>
                  <li>✓ Returns processed within 7 days</li>
                </ul>
              </div>
            </div>

            {/* Sidebar — Investment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl shadow-card border border-border/50 p-6 space-y-5">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Unit Price</div>
                  <div className="text-3xl font-display font-bold">৳{batch.unitPrice.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Min Investment</div>
                    <div className="text-sm font-semibold">৳{batch.minInvestment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Est. Return</div>
                    <div className="text-sm font-semibold text-primary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {batch.returnEstimate}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{batch.fundedUnits}/{batch.totalUnits} units funded</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{batch.deadline}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <Button className="w-full" size="lg">
                    Invest Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    Add to Watchlist
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  By investing, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BatchDetail;
