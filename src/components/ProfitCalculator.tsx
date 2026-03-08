import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Package, Banknote, Truck } from "lucide-react";

const presets = [
  { label: "৳10,000", value: 10000 },
  { label: "৳25,000", value: 25000 },
  { label: "৳50,000", value: 50000 },
  { label: "৳1,00,000", value: 100000 },
];

const ProfitCalculator = () => {
  const [investment, setInvestment] = useState(25000);

  // Example product: cost 300, retail 650, logistics 40/unit
  const costPerUnit = 300;
  const retailPrice = 650;
  const logisticsCostPerUnit = 40;
  const units = Math.floor(investment / costPerUnit);
  const totalCost = units * costPerUnit;
  const revenue = units * retailPrice;
  const logisticsCost = units * logisticsCostPerUnit;
  const grossProfit = revenue - totalCost - logisticsCost;
  const profit = Math.round(grossProfit * 0.85); // after 15% platform commission
  const returnPct = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(0) : "0";

  return (
    <section className="py-24 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Profit Example
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            See how your <span className="text-gradient-primary">investment grows</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Example based on a Premium Cotton T-Shirt batch — ৳300 production cost, ৳650 retail price, ৳40/unit logistics.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Input */}
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Choose investment amount
                </label>
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
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>৳10,000</span>
                  <span className="font-semibold text-foreground text-sm">৳{investment.toLocaleString()}</span>
                  <span>৳2,00,000</span>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center text-center">
                  <Package className="w-5 h-5 text-muted-foreground mb-2" />
                  <div className="text-2xl font-display font-bold text-foreground">{units}</div>
                  <div className="text-xs text-muted-foreground">Units Owned</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center text-center">
                  <Banknote className="w-5 h-5 text-muted-foreground mb-2" />
                  <div className="text-2xl font-display font-bold text-foreground">৳{totalCost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Cost</div>
                </div>
                <div className="bg-accent/50 rounded-xl p-4 flex flex-col items-center text-center">
                  <TrendingUp className="w-5 h-5 text-accent-foreground mb-2" />
                  <div className="text-2xl font-display font-bold text-accent-foreground">৳{revenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Revenue (at retail)</div>
                </div>
                <div className="bg-destructive/5 rounded-xl p-4 flex flex-col items-center text-center border border-destructive/10">
                  <Truck className="w-5 h-5 text-muted-foreground mb-2" />
                  <div className="text-2xl font-display font-bold text-foreground">৳{logisticsCost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Logistics Cost</div>
                </div>
                <div className="col-span-2 bg-primary/10 rounded-xl p-4 flex flex-col items-center text-center border border-primary/20">
                  <Calculator className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl font-display font-bold text-primary">৳{profit.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Net Profit (~{returnPct}% ROI, after logistics + 15% fee)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border-t border-border px-8 py-4 space-y-1">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">✔ Profit estimate only</span>
              <span className="flex items-center gap-1">✔ Not guaranteed return</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Logistics includes delivery, packaging, warehouse, return loss & damage (~৳{logisticsCostPerUnit}/unit). Actual costs vary by product and location.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;
