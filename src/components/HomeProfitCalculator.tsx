import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Banknote, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { allocateUnits, calcInvestmentEstimate } from "@/lib/calculations";

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
    <section className="py-24 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Profit Simulator
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            See your <span className="text-gradient-primary">potential returns</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Slide to choose how many units you want to finance. Results based on 80% expected sell-through.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-8 md:p-10">
            {/* Unit slider */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Product Units</span>
                <div className="flex items-center gap-2 bg-accent rounded-full px-4 py-1.5">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-xl font-display font-bold text-foreground">{units}</span>
                  <span className="text-sm text-muted-foreground">units</span>
                </div>
              </div>
              <Slider
                min={10}
                max={200}
                step={5}
                value={[units]}
                onValueChange={([v]) => setUnits(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>10 units</span>
                <span>200 units</span>
              </div>
            </div>

            {/* Results — 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-6 text-center">
                <Banknote className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-1">Investment</div>
                <div className="text-3xl font-display font-bold text-foreground">
                  ৳{est.inventoryCost.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {units} × ৳{COST_PER_UNIT} per unit
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/15">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-1">Expected Return</div>
                <div className="text-3xl font-display font-bold text-primary">
                  ৳{expectedReturn.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  at 80% sell-through
                </div>
              </div>

              <div className={`rounded-xl p-6 text-center border ${
                profit >= 0 
                  ? "bg-green-500/5 border-green-500/15" 
                  : "bg-destructive/5 border-destructive/15"
              }`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  profit >= 0 ? "bg-green-500/10" : "bg-destructive/10"
                }`}>
                  <span className={`text-lg font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                    %
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Profit</div>
                <div className={`text-3xl font-display font-bold ${
                  profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                }`}>
                  {profit >= 0 ? "+" : ""}৳{profit.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {est.retailROI.toFixed(0)}% ROI
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link to="/signup">
                <Button variant="default" size="lg" className="px-8">
                  Start with ৳{est.inventoryCost.toLocaleString("en-IN")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/30 border-t border-border px-8 py-4">
            <p className="text-xs text-muted-foreground text-center">
              ✔ এটি কোনো বিনিয়োগ নয়। ✔ আপনি নির্দিষ্ট প্রোডাক্ট ইউনিটের মালিক হবেন। ✔ বিক্রি না হলে প্রোডাক্ট সংগ্রহ করতে পারবেন।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeProfitCalculator;
