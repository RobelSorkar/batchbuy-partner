import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, TrendingUp, ShoppingBag, Truck, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { calcInvestmentEstimate } from "@/lib/calculations";

const EXAMPLE_PRODUCT = {
  name: "চামড়ার ক্যাজুয়াল জুতা",
  nameEn: "Leather Casual Shoe",
  category: "Footwear",
  costPerUnit: 400,
  wholesalePrice: 550,
  retailPrice: 750,
  logisticsPerUnit: 100,
};

const SELL_THROUGH = 80;
const MIN_INVESTMENT = 10_000;

const HomeProfitCalculator = () => {
  const { costPerUnit } = EXAMPLE_PRODUCT;
  const minUnits = Math.ceil(MIN_INVESTMENT / costPerUnit);
  const [units, setUnits] = useState(minUnits);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { wholesalePrice, retailPrice, logisticsPerUnit } = EXAMPLE_PRODUCT;

  const investmentAmount = units * costPerUnit;
  const est = calcInvestmentEstimate(
    investmentAmount,
    costPerUnit,
    wholesalePrice,
    retailPrice,
    logisticsPerUnit,
    SELL_THROUGH
  );

  const unitsSold = Math.min(Math.round(units * (SELL_THROUGH / 100)), units);
  const unsoldUnits = units - unitsSold;
  const expectedReturn = est.inventoryCost + est.retailNetProfit;
  const profit = est.retailNetProfit;
  const isPositive = profit >= 0;

  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3">Unit Economics</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
            প্রোডাক্ট থেকে কত লাভ হবে?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            একটি উদাহরণ প্রোডাক্ট দিয়ে দেখুন — ইউনিট সংখ্যা বাড়ান/কমান এবং আপনার সম্ভাব্য রিটার্ন দেখুন।
          </p>
        </div>

        <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
          {/* Example product header */}
          <div className="bg-muted/40 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{EXAMPLE_PRODUCT.nameEn}</p>
                  <p className="text-xs text-muted-foreground">{EXAMPLE_PRODUCT.category} • {EXAMPLE_PRODUCT.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center">
                  <span className="text-muted-foreground block">প্রোডাকশন খরচ</span>
                  <span className="font-bold text-foreground">৳{costPerUnit}</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <span className="text-muted-foreground block">বিক্রয় মূল্য</span>
                  <span className="font-bold text-primary">৳{retailPrice}</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <span className="text-muted-foreground block">মার্জিন/ইউনিট</span>
                  <span className="font-bold text-primary">৳{retailPrice - costPerUnit - logisticsPerUnit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">আপনি কতটি ইউনিট নিতে চান?</span>
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Package className="w-4 h-4 text-primary" />
                  {units} ইউনিট
                </div>
              </div>
              <Slider
                min={minUnits}
                max={200}
                step={5}
                value={[units]}
                onValueChange={([v]) => setUnits(v)}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>{minUnits} ইউনিট (৳{MIN_INVESTMENT.toLocaleString()})</span>
                <span>২০০ ইউনিট</span>
              </div>
            </div>

            {/* Results - 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">মোট বিনিয়োগ</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold font-display">
                  ৳{est.inventoryCost.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {units} ইউনিট × ৳{costPerUnit}
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">প্রত্যাশিত রিটার্ন</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold font-display text-primary">
                  ৳{expectedReturn.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {unitsSold} ইউনিট বিক্রি (80%)
                  {unsoldUnits > 0 && ` + ${unsoldUnits} অবিক্রিত`}
                </p>
              </div>

              <div className={`rounded-xl p-5 ${
                isPositive
                  ? "border border-primary/20 bg-primary/5"
                  : "border border-destructive/20 bg-destructive/5"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isPositive ? "bg-primary/10" : "bg-destructive/10"
                  }`}>
                    <BarChart3 className={`w-3.5 h-3.5 ${isPositive ? "text-primary" : "text-destructive"}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">নেট লাভ</span>
                </div>
                <div className={`text-2xl md:text-3xl font-bold font-display ${
                  isPositive ? "text-primary" : "text-destructive"
                }`}>
                  {isPositive ? "+" : ""}৳{profit.toLocaleString("en-IN")}
                </div>
                <p className={`text-xs mt-1 font-medium ${isPositive ? "text-primary/70" : "text-destructive/70"}`}>
                  {est.retailROI.toFixed(0)}% ROI
                  {isPositive ? " ✓ লাভজনক" : " — কম ইউনিটে খরচ বেশি"}
                </p>
              </div>
            </div>

            {/* Cost breakdown toggle */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 mb-4"
            >
              খরচের বিস্তারিত হিসাব দেখুন
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBreakdown && (
              <div className="rounded-xl bg-muted/30 border border-border/50 p-5 mb-6 space-y-3 text-sm">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">খরচ ও আয়ের হিসাব</h4>
                
                <div className="space-y-2">
                  <Row label={`ইনভেন্টরি খরচ (${units} × ৳${costPerUnit})`} value={`৳${est.inventoryCost.toLocaleString()}`} />
                  <Row label={`লজিস্টিক্স খরচ (${units} × ৳${logisticsPerUnit})`} value={`৳${est.logisticsCost.toLocaleString()}`} />
                  <Row label={`মার্কেটিং খরচ (রিটেইল রেভিনিউ-র ১০%)`} value={`৳${est.retailMarketingCost.toLocaleString()}`} />
                  
                  <div className="border-t border-border/40 pt-2" />
                  <Row label="মোট খরচ" value={`৳${(est.inventoryCost + est.logisticsCost + est.retailMarketingCost).toLocaleString()}`} bold />
                  
                  <div className="border-t border-border/40 pt-2" />
                  <Row label={`বিক্রয় আয় (${unitsSold} × ৳${retailPrice})`} value={`৳${est.retailRevenue.toLocaleString()}`} />
                  <Row label="গ্রস প্রফিট" value={`৳${est.retailGrossProfit.toLocaleString()}`} highlight={est.retailGrossProfit >= 0} negative={est.retailGrossProfit < 0} />
                  
                  {est.retailCommission > 0 && (
                    <Row label="প্ল্যাটফর্ম কমিশন (গ্রস প্রফিটের ১৫%)" value={`-৳${est.retailCommission.toLocaleString()}`} muted />
                  )}
                  
                  <div className="border-t border-border/40 pt-2" />
                  <Row label="নেট লাভ" value={`${profit >= 0 ? "+" : ""}৳${profit.toLocaleString()}`} bold highlight={profit >= 0} negative={profit < 0} />
                </div>
              </div>
            )}

            {/* Tip for negative profit */}
            {!isPositive && (
              <div className="rounded-lg bg-accent/50 border border-accent p-3 mb-6 text-xs text-accent-foreground">
                💡 <strong>টিপ:</strong> কম ইউনিটে লজিস্টিক্স ও মার্কেটিং খরচ বেশি পড়ে। সাধারণত <strong>৩০+ ইউনিট</strong> থেকে লাভ শুরু হয়। স্লাইডার ডানে টানুন!
              </div>
            )}

            <div className="text-center">
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  প্রোডাকশনে যোগ দিন
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

function Row({ label, value, bold, muted, highlight, negative }: {
  label: string; value: string; bold?: boolean; muted?: boolean; highlight?: boolean; negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={muted ? "text-muted-foreground" : "text-foreground text-xs"}>{label}</span>
      <span className={`font-mono text-xs ${bold ? "font-bold" : "font-medium"} ${
        highlight ? "text-primary" : negative ? "text-destructive" : muted ? "text-muted-foreground" : "text-foreground"
      }`}>
        {value}
      </span>
    </div>
  );
}

export default HomeProfitCalculator;
