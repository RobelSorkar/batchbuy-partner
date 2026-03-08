import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  TrendingUp,
  Package,
  Banknote,
  Truck,
  BarChart3,
} from "lucide-react";
import { PLATFORM_COMMISSION_RATE } from "@/types/batch";
import LogisticsBreakdown from "@/components/calculator/LogisticsBreakdown";
import FinancialBreakdown from "@/components/calculator/FinancialBreakdown";

const presets = [
  { label: "৳10,000", value: 10000 },
  { label: "৳25,000", value: 25000 },
  { label: "৳50,000", value: 50000 },
  { label: "৳1,00,000", value: 100000 },
];

const scenarios = [
  { label: "Best Case", rate: 100, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { label: "Expected", rate: 80, color: "text-accent-foreground", bg: "bg-accent/50 border-accent-foreground/20" },
  { label: "Worst Case", rate: 60, color: "text-destructive", bg: "bg-destructive/5 border-destructive/10" },
];

function calcScenario(
  financingAmount: number,
  costPerUnit: number,
  wholesalePrice: number,
  retailPrice: number,
  logisticsCost: number,
  sellThroughPct: number
) {
  const unitsFinanced = Math.ceil(financingAmount / costPerUnit);
  const totalCost = unitsFinanced * costPerUnit;
  const additionalRequired = totalCost - financingAmount;
  const unitsSold = Math.round(unitsFinanced * (sellThroughPct / 100));
  const unsoldUnits = unitsFinanced - unitsSold;

  const totalLogistics = unitsFinanced * logisticsCost;
  const totalCostWithLogistics = totalCost + totalLogistics;

  const wholesaleRevenue = unitsSold * wholesalePrice;
  const wholesaleGrossProfit = wholesaleRevenue - totalCostWithLogistics;

  const retailRevenue = unitsSold * retailPrice;
  const retailGrossProfit = retailRevenue - totalCostWithLogistics;

  const commission = retailGrossProfit > 0 ? Math.round(retailGrossProfit * PLATFORM_COMMISSION_RATE) : 0;
  const netProfit = retailGrossProfit - commission;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  return {
    unitsFinanced,
    totalCost,
    additionalRequired,
    unitsSold,
    unsoldUnits,
    totalLogistics,
    totalCostWithLogistics,
    wholesaleRevenue,
    wholesaleGrossProfit,
    retailRevenue,
    retailGrossProfit,
    commission,
    netProfit,
    roi,
  };
}

const ProfitCalculator = () => {
  const [investment, setInvestment] = useState(25000);
  const [logisticsCostPerUnit, setLogisticsCostPerUnit] = useState(40);
  const [sellThrough, setSellThrough] = useState(80);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const costPerUnit = 380;
  const wholesalePrice = 520;
  const retailPrice = 650;

  const main = calcScenario(investment, costPerUnit, wholesalePrice, retailPrice, logisticsCostPerUnit, sellThrough);

  return (
    <section className="py-24 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Profit Simulator
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            See how your <span className="text-gradient-primary">financing grows</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Based on a Premium Cotton T-Shirt — ৳{costPerUnit} production cost, ৳{wholesalePrice} wholesale, ৳{retailPrice} retail.
            Adjust logistics and sell-through to simulate realistic outcomes.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            {/* Financing Amount */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Choose financing amount</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {presets.map((p) => (
                  <Button
                    key={p.value}
                    variant={investment === p.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInvestment(p.value)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Slider
                min={10000}
                max={200000}
                step={5000}
                value={[investment]}
                onValueChange={([v]) => setInvestment(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>৳10,000</span>
                <span className="font-semibold text-foreground text-sm">
                  ৳{investment.toLocaleString()}
                </span>
                <span>৳2,00,000</span>
              </div>
            </div>

            {/* Logistics + Sell-Through Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="logistics" className="flex items-center gap-1.5 text-sm">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  Logistics Cost per Unit (BDT)
                </Label>
                <Input
                  id="logistics"
                  type="number"
                  min={0}
                  max={200}
                  step={5}
                  value={logisticsCostPerUnit}
                  onChange={(e) => setLogisticsCostPerUnit(Number(e.target.value) || 0)}
                  className="font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  Expected Sell-Through Rate: <span className="font-bold text-foreground">{sellThrough}%</span>
                </Label>
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={[sellThrough]}
                  onValueChange={([v]) => setSellThrough(v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Logistics Breakdown */}
            <LogisticsBreakdown
              logisticsCostPerUnit={logisticsCostPerUnit}
              unitsFinanced={main.unitsFinanced}
            />

            {/* Additional Amount Required */}
            {main.additionalRequired > 0 && (
              <div className="bg-accent/30 rounded-xl p-4 border border-accent-foreground/10 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Additional amount required</span>
                <span className="font-mono font-bold text-accent-foreground">৳{main.additionalRequired.toLocaleString()}</span>
              </div>
            )}

            {/* Main Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center text-center">
                <Package className="w-5 h-5 text-muted-foreground mb-2" />
                <div className="text-2xl font-display font-bold text-foreground">{main.unitsFinanced}</div>
                <div className="text-xs text-muted-foreground">Units Financed</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center text-center">
                <Banknote className="w-5 h-5 text-muted-foreground mb-2" />
                <div className="text-2xl font-display font-bold text-foreground">
                  ৳{main.totalCostWithLogistics.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
              </div>
              <div className="bg-accent/50 rounded-xl p-4 flex flex-col items-center text-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground mb-2" />
                <div className="text-2xl font-display font-bold text-accent-foreground">
                  {main.unitsSold} / {main.unitsFinanced}
                </div>
                <div className="text-xs text-muted-foreground">Units Sold ({sellThrough}%)</div>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 flex flex-col items-center text-center border border-primary/20">
                <Calculator className="w-5 h-5 text-primary mb-2" />
                <div className={`text-2xl font-display font-bold ${main.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                  ৳{main.netProfit.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Net Profit ({main.roi.toFixed(0)}% ROI)</div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <FinancialBreakdown
              show={showBreakdown}
              onToggle={() => setShowBreakdown(!showBreakdown)}
              investment={investment}
              costPerUnit={costPerUnit}
              wholesalePrice={wholesalePrice}
              retailPrice={retailPrice}
              logisticsCostPerUnit={logisticsCostPerUnit}
              sellThrough={sellThrough}
              main={main}
            />

            {/* Scenario Simulation */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Scenario Projections
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {scenarios.map((s) => {
                  const sc = calcScenario(investment, costPerUnit, wholesalePrice, retailPrice, logisticsCostPerUnit, s.rate);
                  return (
                    <div
                      key={s.label}
                      className={`rounded-xl p-4 border ${s.bg} space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wide ${s.color}`}>
                          {s.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{s.rate}% sell-through</span>
                      </div>
                      <div className={`text-xl font-display font-bold ${s.color}`}>
                        ৳{sc.netProfit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sc.unitsSold} units sold · {sc.roi.toFixed(0)}% ROI
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border-t border-border px-8 py-4 space-y-1">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✔ Profit estimate only</span>
              <span>✔ Not guaranteed return</span>
              <span>✔ Commission on gross profit</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Net Profit = (Revenue − Total Cost − Logistics) × (1 − 15% commission). ROI = Net Profit ÷ Financing Amount × 100.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;
