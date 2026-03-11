import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { calcInvestmentEstimate } from "@/lib/calculations";

const COST_PER_UNIT = 420;
const WHOLESALE_PRICE = 520;
const RETAIL_PRICE = 650;
const LOGISTICS_PER_UNIT = 100;
const SELL_THROUGH = 80;

const HomeProfitCalculator = () => {
  const [units, setUnits] = useState(50);

  const investmentAmount = units * COST_PER_UNIT;
  const est = calcInvestmentEstimate(
    investmentAmount,
    COST_PER_UNIT,
    WHOLESALE_PRICE,
    RETAIL_PRICE,
    LOGISTICS_PER_UNIT,
    SELL_THROUGH
  );

  const expectedReturn = est.inventoryCost + est.retailNetProfit;
  const profit = est.retailNetProfit;

  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3">Unit Economics</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
            See your potential returns
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Slide to choose units. Based on 80% sell-through rate.
          </p>
        </div>

        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Product Units</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <Package className="w-4 h-4 text-primary" />
                  {units} units
                </div>
              </div>
              <Slider
                min={10}
                max={200}
                step={5}
                value={[units]}
                onValueChange={([v]) => setUnits(v)}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-[11px] text-muted-foreground mb-1">Investment</div>
                <div className="text-xl md:text-2xl font-bold font-display">
                  ৳{est.inventoryCost.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {units} × ৳{COST_PER_UNIT}
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-center">
                <div className="text-[11px] text-muted-foreground mb-1">Expected Return</div>
                <div className="text-xl md:text-2xl font-bold font-display text-primary">
                  ৳{expectedReturn.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  80% sell-through
                </div>
              </div>

              <div className={`rounded-lg p-4 text-center ${
                profit >= 0 ? "bg-primary/5 border border-primary/10" : "bg-destructive/5 border border-destructive/10"
              }`}>
                <div className="text-[11px] text-muted-foreground mb-1">Profit</div>
                <div className={`text-xl md:text-2xl font-bold font-display ${
                  profit >= 0 ? "text-primary" : "text-destructive"
                }`}>
                  {profit >= 0 ? "+" : ""}৳{profit.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {est.retailROI.toFixed(0)}% ROI
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  Start with ৳{est.inventoryCost.toLocaleString("en-IN")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t border-border px-6 py-3 bg-muted/30">
            <p className="text-[11px] text-muted-foreground text-center">
              ✔ এটি বিনিয়োগ নয় — আপনি প্রোডাক্ট ইউনিটের মালিক হবেন ✔ বিক্রি না হলে প্রোডাক্ট সংগ্রহ করতে পারবেন
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeProfitCalculator;
