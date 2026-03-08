import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBatches } from "@/data/mockBatches";
import { BatchStatus } from "@/types/batch";

const statusColors: Record<string, string> = {
  funding: "bg-accent text-accent-foreground",
  production: "bg-secondary text-secondary-foreground",
  completed: "bg-primary/10 text-primary",
  shipping: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  funding: "Funding", production: "In Production", completed: "Completed",
  shipping: "Shipping", draft: "Draft", cancelled: "Cancelled",
};

const filterOptions: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Funding", value: "funding" },
  { label: "Production", value: "production" },
  { label: "Completed", value: "completed" },
];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockBatches.filter((b) => {
    const matchSearch = b.productName.toLowerCase().includes(search.toLowerCase()) ||
      b.batchName.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Production Batch Marketplace</h1>
            <p className="text-muted-foreground text-lg">
              Browse batches, invest from ৳10,000 BDT, and own product units
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, batch, or category..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {filterOptions.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} batches found</p>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((batch) => {
              const progress = Math.round((batch.fundedUnits / batch.totalQuantity) * 100);
              const profitPerUnit = batch.retailPrice - batch.productionCostPerUnit;
              const returnPct = ((profitPerUnit / batch.productionCostPerUnit) * 100).toFixed(0);

              return (
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
                        {statusLabels[batch.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">{batch.category}</span>
                    </div>

                    <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {batch.productName}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{batch.batchName}</p>

                    {/* Pricing row */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-muted/50 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-muted-foreground">Cost</div>
                        <div className="text-xs font-semibold">৳{batch.productionCostPerUnit}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-muted-foreground">Wholesale</div>
                        <div className="text-xs font-semibold">৳{batch.wholesalePrice}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-muted-foreground">Retail</div>
                        <div className="text-xs font-semibold">৳{batch.retailPrice}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">
                        Est. Return
                      </span>
                      <span className="text-sm font-semibold text-primary flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {returnPct}%
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {batch.fundedUnits}/{batch.totalQuantity} units · {batch.remainingUnits} left
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {batch.status === "completed" ? (
                          <><CheckCircle className="w-3 h-3" /> Completed</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Min ৳{batch.minParticipation.toLocaleString()}</>
                        )}
                      </span>
                      <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No batches found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
