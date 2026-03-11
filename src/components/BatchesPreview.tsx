import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Factory, Clock, TrendingUp } from "lucide-react";
import { useBatches } from "@/hooks/useBatches";
import { Progress } from "@/components/ui/progress";
import { getProductImage } from "@/utils/productImages";

const statusColors: Record<string, string> = {
  funding: "bg-primary/15 text-primary border-primary/20",
  production: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const BatchesPreview = () => {
  const { data: batches, isLoading } = useBatches();
  const fundingBatches = (batches || []).filter((b) => b.status === "funding").slice(0, 3);

  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Live Batches
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              Active <span className="text-gradient-primary">production batches</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Browse real product batches currently accepting partners. Each batch is tied to a specific manufacturer and product line.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" className="gap-2">
              View All Batches <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : fundingBatches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No active batches right now. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {fundingBatches.map((batch) => {
              const progress = Math.round((batch.funded_units / batch.total_quantity) * 100);
              const returnPct = Math.round(((batch.retail_price - batch.production_cost_per_unit) / batch.production_cost_per_unit) * 100);
              const imgSrc = (batch.image && batch.image.startsWith("http")) ? batch.image : getProductImage(batch.product_name);

              return (
                <Link to={`/batch/${batch.id}`} key={batch.id} className="group">
                  <div className="rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={batch.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {batch.image || "📦"}
                        </div>
                      )}
                      {/* Status badge */}
                      <span className={`absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full border font-semibold backdrop-blur-sm ${statusColors[batch.status] || "bg-muted text-muted-foreground"}`}>
                        {batch.status === "funding" ? "Open for Investment" : batch.status}
                      </span>
                      {/* Progress overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-3 pt-8">
                        <div className="flex justify-between text-[11px] text-foreground/80 mb-1.5 font-medium">
                          <span>{batch.funded_units} / {batch.total_quantity} units funded</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Title & Factory */}
                      <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors leading-tight">
                        {batch.product_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                        <Factory className="w-3.5 h-3.5" />
                        <span>{batch.manufacturer || batch.batch_name}</span>
                      </div>

                      {/* Key metrics — 3 columns */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Per Unit</div>
                          <div className="font-display font-bold text-foreground">
                            ৳{batch.production_cost_per_unit.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Profit
                          </div>
                          <div className="font-display font-bold text-primary">
                            +{returnPct}%
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> Cycle
                          </div>
                          <div className="font-display font-bold text-foreground">
                            {batch.production_time_days || 30}d
                          </div>
                        </div>
                      </div>

                      {/* Footer: partners + CTA */}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {batch.partners_joined} partners · Min ৳{batch.min_participation.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                          Invest Now <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BatchesPreview;
