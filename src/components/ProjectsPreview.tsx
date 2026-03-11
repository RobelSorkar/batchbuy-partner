import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Factory, Clock, TrendingUp } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Progress } from "@/components/ui/progress";
import { getProductImage } from "@/utils/productImages";

const statusColors: Record<string, string> = {
  funding: "bg-primary/10 text-primary",
  production: "bg-blue-500/10 text-blue-600",
  completed: "bg-muted text-muted-foreground",
};

const ProjectsPreview = () => {
  const { data: batches, isLoading } = useProjects();
  const fundingBatches = (batches || []).filter((b) => b.status === "funding").slice(0, 3);

  return (
    <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-primary mb-2 sm:mb-3">Live Projects</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight">
              Open production projects
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2 max-w-md">
              Browse real production projects currently accepting financing partners.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="gap-1.5 h-10 sm:h-9">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : fundingBatches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No active projects right now. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {fundingBatches.map((batch) => {
              const progress = Math.round((batch.funded_units / batch.total_quantity) * 100);
              const returnPct = Math.round(((batch.retail_price - batch.production_cost_per_unit) / batch.production_cost_per_unit) * 100);
              const imgSrc = (batch.image && batch.image.startsWith("http")) ? batch.image : getProductImage(batch.product_name);

              return (
                <Link to={`/batch/${batch.id}`} key={batch.id} className="group">
                  <div className="rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={batch.product_name}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                          📦
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 text-[11px] px-2 py-0.5 rounded-md font-medium ${statusColors[batch.status] || "bg-muted text-muted-foreground"}`}>
                        {batch.status === "funding" ? "Open" : batch.status}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-base mb-0.5 group-hover:text-primary transition-colors">
                        {batch.product_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Factory className="w-3 h-3" />
                        {batch.manufacturer || batch.batch_name}
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>{batch.funded_units}/{batch.total_quantity} units</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 sm:h-1" />
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Cost/Unit</div>
                          <div className="text-xs sm:text-sm font-semibold">৳{batch.production_cost_per_unit.toLocaleString("en-IN")}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> Return
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-primary">+{returnPct}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Cycle
                          </div>
                          <div className="text-xs sm:text-sm font-semibold">{batch.production_time_days || 30}d</div>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                          {batch.partners_joined} partners · Min ৳{batch.min_participation.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                          Join <ArrowRight className="w-3 h-3" />
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
