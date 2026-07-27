import { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, Users, MapPin, Calendar, Shield, Calculator, Loader2, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MARKETING_COST_RATE } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JoinProjectDialog from "@/components/JoinProjectDialog";
import LogisticsBreakdown from "@/components/calculator/LogisticsBreakdown";
import ProductImageZoom from "@/components/ProductImageZoom";
import ProjectCountdown from "@/components/ProjectCountdown";
import CustomerOrderForm from "@/components/CustomerOrderForm";
import { useProjectDetail, useProjectParticipations } from "@/hooks/useProjects";
import {
  MINIMUM_PARTICIPATION_BDT,
  calcPerUnitProfit,
  calcInvestmentEstimate,
  calcIndependentEstimate,
} from "@/lib/calculations";

const statusColors: Record<string, string> = {
  funding: "bg-accent text-accent-foreground",
  production: "bg-secondary text-secondary-foreground",
  completed: "bg-primary/10 text-primary",
  shipping: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  funding: "Funding", production: "In Production", completed: "Completed", shipping: "Shipping",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: batch, isLoading } = useProjectDetail(id);
  const { data: participations } = useProjectParticipations(id);
  const [joinOpen, setJoinOpen] = useState(false);

  const referrerId = searchParams.get("ref");
  const isCustomerView = referrerId && referrerId !== "dropshipper" && referrerId.length > 10;

  const handleJoinClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setJoinOpen(true);
  };

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
          <h1 className="text-2xl font-display font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/marketplace"><Button>Back to Marketplace</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = Math.round((batch.funded_units / batch.total_quantity) * 100);
  const logisticsCost = Number((batch as any).logistics_cost_per_unit) || 0;
  const retailMarketingPerUnit = Math.round(batch.retail_price * MARKETING_COST_RATE);

  // Use global calculation engine
  const perUnit = calcPerUnitProfit(batch.production_cost_per_unit, batch.wholesale_price, batch.retail_price, logisticsCost);
  const profitPerUnit = perUnit.retailNetPerUnit;
  const returnPct = perUnit.retailReturnPct.toFixed(1);
  const canJoin = batch.status === "funding" && batch.remaining_units > 0;

  // Map DB row to the shape JoinProjectDialog expects
  const projectForDialog = {
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
    logisticsCostPerUnit: logisticsCost,
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
              <ProductImageZoom productName={batch.product_name} imageUrl={batch.image} fallbackEmoji={batch.image && !batch.image.startsWith("http") ? batch.image : "📦"} />

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
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Production Cost</div>
                    <div className="text-base sm:text-xl font-display font-bold">৳{batch.production_cost_per_unit}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Your financing</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Logistics</div>
                    <div className="text-base sm:text-xl font-display font-bold">৳{logisticsCost}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Per unit</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                      <Megaphone className="w-3 h-3" /> Marketing
                    </div>
                    <div className="text-base sm:text-xl font-display font-bold">৳{retailMarketingPerUnit}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">10% of retail</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1">Option A: Sell via Platform</div>
                    <div className="text-xs text-muted-foreground mb-1">Retail Price: ৳{batch.retail_price}</div>
                    <div className="text-xs text-primary">+৳{profitPerUnit} net/unit ({returnPct}%)</div>
                    <div className="text-[10px] text-muted-foreground mt-1">After logistics + marketing + 15% fee</div>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg border border-accent-foreground/10">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-accent-foreground mb-1">Option B: Take Delivery</div>
                    <div className="text-xs text-muted-foreground mb-1">Retail Price: ৳{batch.retail_price}</div>
                    <div className="text-xs text-accent-foreground">+৳{batch.retail_price - batch.production_cost_per_unit} potential/unit ({((batch.retail_price - batch.production_cost_per_unit) / batch.production_cost_per_unit * 100).toFixed(1)}%)</div>
                    <div className="text-[10px] text-muted-foreground mt-1">No logistics, marketing, or commission</div>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
                  <p>✔ এটি কোনো বিনিয়োগ নয়।</p>
                  <p>✔ আপনি নির্দিষ্ট প্রোডাক্ট ইউনিটের মালিক হবেন।</p>
                  <p>✔ বিক্রি না হলে আপনার প্রোডাক্ট অবিকৃত অবস্থায় সংগ্রহ করতে পারবেন।</p>
                </div>
              </div>

              {/* Logistics Breakdown */}
              <LogisticsBreakdown logisticsCostPerUnit={logisticsCost} unitsFinanced={1} />

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
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
              <div className="sticky top-24 space-y-6">
                {/* Customer Order Form - shown when accessed via referral link */}
                {isCustomerView && (batch.status === "production" || batch.status === "completed") && (
                  <CustomerOrderForm
                    batchId={batch.id}
                    productName={batch.product_name}
                    retailPrice={batch.retail_price}
                    referrerId={referrerId}
                    image={batch.image || undefined}
                  />
                )}

                {/* Partner/Investor sidebar - hidden in customer view */}
                {!isCustomerView && (
                  <div className="bg-card rounded-xl shadow-card border border-border/50 p-6 space-y-5">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Production Cost / Unit</div>
                      <div className="text-3xl font-display font-bold">৳{batch.production_cost_per_unit}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Min Financing</div>
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
                      <p className="text-xs font-medium text-accent-foreground">Example: ৳10,000 financing</p>
                      {(() => {
                        const ex = calcInvestmentEstimate(MINIMUM_PARTICIPATION_BDT, batch.production_cost_per_unit, batch.wholesale_price, batch.retail_price, logisticsCost);
                        const indie = calcIndependentEstimate(MINIMUM_PARTICIPATION_BDT, batch.production_cost_per_unit, batch.wholesale_price, batch.retail_price);
                        return (
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Product Units</span>
                              <span className="font-semibold">{ex.unitsFinanced}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Inventory Cost</span>
                              <span>৳{ex.inventoryCost.toLocaleString()}</span>
                            </div>

                            <div className="border-t border-border/30 pt-2 mt-2 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wide text-primary">Option A: Platform Sale</div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Est. Net Profit</span>
                                <span className="font-semibold text-primary">৳{ex.retailNetProfit.toLocaleString()}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">After logistics + marketing + 15% fee</div>
                            </div>

                            <div className="border-t border-border/30 pt-2 mt-1 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wide text-accent-foreground">Option B: Take Delivery</div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Potential Profit</span>
                                <span className="font-semibold text-accent-foreground">৳{indie.potentialProfit.toLocaleString()}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">No logistics, marketing, or commission</div>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                        <p>✔ এটি কোনো বিনিয়োগ নয়।</p>
                        <p>✔ আপনি নির্দিষ্ট প্রোডাক্ট ইউনিটের মালিক হবেন।</p>
                        <p>✔ বিক্রি না হলে আপনার প্রোডাক্ট অবিকৃত অবস্থায় সংগ্রহ করতে পারবেন।</p>
                      </div>
                    </div>

                    <ProjectCountdown deadline={batch.deadline} status={batch.status} />

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Production: {batch.production_time_days || 30} days</span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {canJoin ? (
                        <Button className="w-full" size="lg" onClick={handleJoinClick}>
                          Join This Project
                        </Button>
                      ) : (
                        <Button className="w-full" size="lg" disabled>
                          {batch.status === "completed" ? "Project Completed" : batch.remaining_units === 0 ? "Fully Funded" : "Not Available"}
                        </Button>
                      )}
                      <Link to="/marketplace">
                        <Button variant="outline" className="w-full" size="lg">
                          Browse More Projects
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Min ৳{batch.min_participation.toLocaleString()} BDT · {batch.partners_joined} partners joined
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <JoinProjectDialog batch={projectForDialog} open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
};

export default ProjectDetail;
