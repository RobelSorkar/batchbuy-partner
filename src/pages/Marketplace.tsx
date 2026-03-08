import { Link } from "react-router-dom";
import { Search, Filter, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const batches = [
  {
    id: "1",
    name: "Premium Cotton T-Shirts — Batch #47",
    category: "Apparel",
    status: "Funding",
    unitPrice: 450,
    totalUnits: 500,
    fundedUnits: 312,
    minInvestment: 10000,
    returnEstimate: "18-22%",
    deadline: "12 days left",
    image: "👕",
  },
  {
    id: "2",
    name: "Organic Skincare Set — Batch #23",
    category: "Beauty",
    status: "Funding",
    unitPrice: 850,
    totalUnits: 300,
    fundedUnits: 198,
    minInvestment: 10000,
    returnEstimate: "20-25%",
    deadline: "8 days left",
    image: "🧴",
  },
  {
    id: "3",
    name: "Handcrafted Leather Wallets — Batch #15",
    category: "Accessories",
    status: "Production",
    unitPrice: 1200,
    totalUnits: 200,
    fundedUnits: 200,
    minInvestment: 12000,
    returnEstimate: "15-20%",
    deadline: "In production",
    image: "👛",
  },
  {
    id: "4",
    name: "Bamboo Kitchen Utensils — Batch #31",
    category: "Home & Kitchen",
    status: "Funding",
    unitPrice: 350,
    totalUnits: 800,
    fundedUnits: 540,
    minInvestment: 10000,
    returnEstimate: "16-19%",
    deadline: "5 days left",
    image: "🥄",
  },
  {
    id: "5",
    name: "Wireless Earbuds Pro — Batch #8",
    category: "Electronics",
    status: "Completed",
    unitPrice: 2200,
    totalUnits: 150,
    fundedUnits: 150,
    minInvestment: 22000,
    returnEstimate: "22% (actual)",
    deadline: "Completed",
    image: "🎧",
  },
  {
    id: "6",
    name: "Artisan Coffee Blend — Batch #52",
    category: "Food & Beverage",
    status: "Funding",
    unitPrice: 280,
    totalUnits: 1000,
    fundedUnits: 120,
    minInvestment: 10000,
    returnEstimate: "14-18%",
    deadline: "20 days left",
    image: "☕",
  },
];

const statusColors: Record<string, string> = {
  Funding: "bg-accent text-accent-foreground",
  Production: "bg-secondary text-secondary-foreground",
  Completed: "bg-primary/10 text-primary",
};

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Production Batch Marketplace</h1>
            <p className="text-muted-foreground text-lg">Browse and invest in active production batches</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search batches..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
            <div className="flex gap-2">
              {["All", "Funding", "Production", "Completed"].map((f) => (
                <Button
                  key={f}
                  variant={f === "All" ? "default" : "outline"}
                  size="sm"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Link
                key={batch.id}
                to={`/batch/${batch.id}`}
                className="group bg-card rounded-xl shadow-card hover:shadow-card-hover border border-border/50 transition-all duration-300 overflow-hidden"
              >
                <div className="h-40 bg-muted/50 flex items-center justify-center text-5xl">
                  {batch.image}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[batch.status]}`}>
                      {batch.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{batch.category}</span>
                  </div>

                  <h3 className="font-display font-semibold text-sm mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {batch.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Unit Price</div>
                      <div className="text-sm font-semibold">৳{batch.unitPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Est. Return</div>
                      <div className="text-sm font-semibold text-primary flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {batch.returnEstimate}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{batch.fundedUnits}/{batch.totalUnits} units</span>
                      <span className="font-medium">{Math.round((batch.fundedUnits / batch.totalUnits) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(batch.fundedUnits / batch.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {batch.status === "Completed" ? (
                        <><CheckCircle className="w-3 h-3" /> {batch.deadline}</>
                      ) : (
                        <><Clock className="w-3 h-3" /> {batch.deadline}</>
                      )}
                    </span>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
