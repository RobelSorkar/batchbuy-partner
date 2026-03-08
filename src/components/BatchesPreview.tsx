import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useBatches } from "@/hooks/useBatches";
import { Progress } from "@/components/ui/progress";

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
              return (
                <Link to={`/batch/${batch.id}`} key={batch.id} className="group">
                  <div className="rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{batch.image || "📦"}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[batch.status] || "bg-muted text-muted-foreground"}`}>
                          {batch.status === "funding" ? "Open for Investment" : batch.status}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {batch.product_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{batch.batch_name}</p>

                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">Cost/unit</div>
                          <div className="font-semibold text-sm">৳{batch.production_cost_per_unit}</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">Retail</div>
                          <div className="font-semibold text-sm">৳{batch.retail_price}</div>
                        </div>
                        <div className="bg-accent/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">Return</div>
                          <div className="font-semibold text-sm text-accent-foreground">~{returnPct}%</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{batch.funded_units} / {batch.total_quantity} units funded</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{batch.partners_joined} partners joined</span>
                        <span>Min ৳{batch.min_participation.toLocaleString()}</span>
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
