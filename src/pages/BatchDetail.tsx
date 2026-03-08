import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, Users, MapPin, Calendar, Shield, Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JoinBatchDialog from "@/components/JoinBatchDialog";
import ProductImageZoom from "@/components/ProductImageZoom";
import { useBatchDetail, useBatchParticipations } from "@/hooks/useBatches";
import { MINIMUM_PARTICIPATION_BDT } from "@/types/batch";

const statusColors: Record<string, string> = {
  funding: "bg-accent text-accent-foreground",
  production: "bg-secondary text-secondary-foreground",
  completed: "bg-primary/10 text-primary",
  shipping: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  funding: "Funding", production: "In Production", completed: "Completed", shipping: "Shipping",
};

const BatchDetail = () => {
  const { id } = useParams();
  const { data: batch, isLoading } = useBatchDetail(id);
  const { data: participations } = useBatchParticipations(id);
  const [joinOpen, setJoinOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-6 text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Batch Not Found</h1>
          <p className="text-muted-foreground mb-4">The batch you're looking for doesn't exist.</p>
          <Link to="/marketplace"><Button>Back to Marketplace</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = Math.round((batch.funded_units / batch.total_quantity) * 100);
  const profitPerUnit = batch.retail_price - batch.production_cost_per_unit;
  const wholesaleProfitPerUnit = batch.wholesale_price - batch.production_cost_per_unit;
  const returnPct = ((profitPerUnit / batch.production_cost_per_unit) * 100).toFixed(1);
  const wholesaleReturnPct = ((wholesaleProfitPerUnit / batch.production_cost_per_unit) * 100).toFixed(1);
  const canJoin = batch.status === "funding" && batch.remaining_units > 0;

  // Map DB batch to the shape JoinBatchDialog expects
  const batchForDialog = {
    id: batch.id,
    productName: batch.product_name,
    batchName: batch.batch_name,
    productionCostPerUnit: batch.production_cost_per_unit,
    wholesalePrice: batch.wholesale_price,
    retailPrice: batch.retail_price,
    totalQuantity: batch.total_quantity,
    remainingUnits: batch.remaining_units,
    fundedUnits: batch.funded_units,
    status: batch.status as any,
    minParticipation: batch.min_participation,
    category: batch.category || "",
    description: batch.description || "",
    manufacturer: batch.manufacturer || "",
    warehouse: batch.warehouse || "",
    productionTimeDays: batch.production_time_days || 30,
    deadline: batch.deadline || "",
    createdAt: batch.created_at,
    image: batch.image || "📦",
    partnersJoined: batch.partners_joined,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-6">
        <div className="container max-w-5xl mx-auto">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted/50 rounded-xl flex items-center justify-center overflow-hidden">
                {getProductImage(batch.product_name) ? (
                  <img src={getProductImage(batch.product_name)!} alt={batch.product_name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-7xl">{batch.image || "📦"}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[batch.status] || ""}`}>
                    {statusLabels[batch.status] || batch.status}
                  </span>
                  <span className="text-sm text-muted-foreground">{batch.category}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">{batch.product_name}</h1>
                <p className="text-lg text-muted-foreground font-medium mb-4">{batch.batch_name}</p>
                <p className="text-muted-foreground leading-relaxed">{batch.description}</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" /> Pricing Breakdown (per unit)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Production Cost</div>
                    <div className="text-xl font-display font-bold">৳{batch.production_cost_per_unit}</div>
                    <div className="text-xs text-muted-foreground mt-1">Your investment</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Wholesale Price</div>
                    <div className="text-xl font-display font-bold">৳{batch.wholesale_price}</div>
                    <div className="text-xs text-primary mt-1">+৳{wholesaleProfitPerUnit} ({wholesaleReturnPct}%)</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Retail Price</div>
                    <div className="text-xl font-display font-bold">৳{batch.retail_price}</div>
                    <div className="text-xs text-primary mt-1">+৳{profitPerUnit} ({returnPct}%)</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: MapPin, label: "Manufacturer", value: batch.manufacturer || "—" },
                  { icon: MapPin, label: "Warehouse", value: batch.warehouse || "—" },
                  { icon: Calendar, label: "Production Time", value: `${batch.production_time_days || 30} days` },
                  { icon: Users, label: "Partners Joined", value: `${batch.partners_joined}` },
                ].map((item) => (
                  <div key={item.label} className="bg-card rounded-lg p-4 border border-border/50 shadow-card">
                    <item.icon className="w-4 h-4 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-sm font-medium leading-tight">{item.value}</div>
                  </div>
                ))}
              </div>

              {(participations || []).length > 0 && (
                <div className="bg-card rounded-xl shadow-card border border-border/50">
                  <div className="p-5 border-b border-border/50">
                    <h3 className="font-display font-semibold">Recent Partners</h3>
                  </div>
                  <div className="divide-y divide-border/30">
                    {(participations || []).slice(0, 10).map((p: any) => (
                      <div key={p.id} className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {(p.profiles?.full_name || "U").charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{p.profiles?.full_name || "Partner"}</div>
                            <div className="text-xs text-muted-foreground">{new Date(p.joined_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{p.units_owned} units</div>
                          <div className="text-xs text-muted-foreground">৳{Number(p.total_invested).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl shadow-card border border-border/50 p-6 space-y-5">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Production Cost / Unit</div>
                  <div className="text-3xl font-display font-bold">৳{batch.production_cost_per_unit}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Min Investment</div>
                    <div className="text-sm font-semibold">৳{batch.min_participation.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Retail Return</div>
                    <div className="text-sm font-semibold text-primary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {returnPct}%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{batch.funded_units}/{batch.total_quantity} funded</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{batch.remaining_units} units remaining</p>
                </div>

                <div className="bg-accent/50 rounded-lg p-4 border border-primary/10 space-y-2">
                  <p className="text-xs font-medium text-accent-foreground">Example: ৳10,000 investment</p>
                  <div className="text-sm">
                    <span className="font-semibold">{Math.floor(MINIMUM_PARTICIPATION_BDT / batch.production_cost_per_unit)} units</span>
                    <span className="text-muted-foreground"> → retail profit </span>
                    <span className="font-semibold text-primary">
                      ৳{(Math.floor(MINIMUM_PARTICIPATION_BDT / batch.production_cost_per_unit) * profitPerUnit).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Production: {batch.production_time_days || 30} days</span>
                </div>

                <div className="space-y-3 pt-2">
                  {canJoin ? (
                    <Button className="w-full" size="lg" onClick={() => setJoinOpen(true)}>
                      Join This Batch
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      {batch.status === "completed" ? "Batch Completed" : batch.remaining_units === 0 ? "Fully Funded" : "Not Available"}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" size="lg">
                    Add to Watchlist
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Min ৳{batch.min_participation.toLocaleString()} BDT · {batch.partners_joined} partners joined
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <JoinBatchDialog batch={batchForDialog} open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
};

export default BatchDetail;
