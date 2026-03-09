import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, TrendingUp, Loader2, Wallet, Store, PackageCheck } from "lucide-react";
import { ProductionBatch } from "@/types/batch";
import {
  MINIMUM_PARTICIPATION_BDT,
  allocateUnits,
  calcInvestmentEstimate,
  calcIndependentEstimate,
} from "@/lib/calculations";
import { useJoinBatch, SellingPreference } from "@/hooks/useJoinBatch";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface JoinBatchDialogProps {
  batch: ProductionBatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinBatchDialog = ({ batch, open, onOpenChange }: JoinBatchDialogProps) => {
  const [investmentInput, setInvestmentInput] = useState(MINIMUM_PARTICIPATION_BDT.toString());
  const [sellingPreference, setSellingPreference] = useState<SellingPreference>("platform");
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const joinBatch = useJoinBatch();
  const walletBalance = wallet?.balance || 0;

  const investmentAmount = Number(investmentInput) || 0;
  const logisticsCost = batch.logisticsCostPerUnit || 0;

  // Use global calculation engine
  const { units, inventoryCost, unusedAmount } = allocateUnits(investmentAmount, batch.productionCostPerUnit);
  const est = units > 0
    ? calcInvestmentEstimate(investmentAmount, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice, logisticsCost)
    : null;
  const indie = units > 0
    ? calcIndependentEstimate(investmentAmount, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice)
    : null;

  const isValid = investmentAmount >= MINIMUM_PARTICIPATION_BDT && units > 0 && units <= batch.remainingUnits;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to join a batch.", variant: "destructive" });
      return;
    }

    try {
      await joinBatch.mutateAsync({
        batchId: batch.id,
        units,
        totalInvested: inventoryCost,
        sellingPreference,
      });
      setSubmitted(true);
    } catch (error: any) {
      toast({ title: "Failed to join batch", description: error.message, variant: "destructive" });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setInvestmentInput(MINIMUM_PARTICIPATION_BDT.toString());
      setSellingPreference("platform");
    }, 300);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Batch Joined Successfully!</h2>
              <p className="text-muted-foreground text-sm mt-2">
                You financed <span className="font-semibold text-foreground">{units} units</span> of{" "}
                <span className="font-semibold text-foreground">{batch.productName}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-muted text-xs font-medium">
                {sellingPreference === "platform" ? <Store className="w-3 h-3" /> : <PackageCheck className="w-3 h-3" />}
                {sellingPreference === "platform" ? "Sell via Platform" : "Take Delivery"}
              </div>
            </div>
            <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2 text-left border border-primary/10">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventory Cost</span>
                <span className="font-semibold">৳{inventoryCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Units</span>
                <span className="font-semibold">{units}</span>
              </div>
              <div className="border-t border-border/30 pt-2 mt-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Platform Sale Profit</span>
                  <span className="font-semibold text-primary">৳{est?.retailNetProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Independent Sale Potential</span>
                  <span className="font-semibold text-accent-foreground">৳{indie?.potentialProfit.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
                <span>✔ Profit estimate only</span>
                <span>✔ Not guaranteed return</span>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Join Production Batch</DialogTitle>
          <DialogDescription>{batch.batchName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Cost/Unit</div>
              <div className="text-sm font-semibold">৳{batch.productionCostPerUnit}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Logistics</div>
              <div className="text-sm font-semibold">৳{logisticsCost}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Wholesale</div>
              <div className="text-sm font-semibold">৳{batch.wholesalePrice}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Retail</div>
              <div className="text-sm font-semibold">৳{batch.retailPrice}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment">Minimum Investment (BDT)</Label>
            <Input
              id="investment" type="number" min={MINIMUM_PARTICIPATION_BDT} step={batch.productionCostPerUnit}
              value={investmentInput} onChange={(e) => setInvestmentInput(e.target.value)} className="text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: ৳{MINIMUM_PARTICIPATION_BDT.toLocaleString()} · Available: {batch.remainingUnits} units
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[10000, 20000, 50000, 100000].map((amt) => (
              <Button key={amt} type="button" variant={investmentAmount === amt ? "default" : "outline"} size="sm" onClick={() => setInvestmentInput(amt.toString())}>
                ৳{(amt / 1000).toFixed(0)}K
              </Button>
            ))}
          </div>

          {/* Selling Preference Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Choose your selling option</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSellingPreference("platform")}
                className={`rounded-lg p-4 border-2 text-left transition-all ${
                  sellingPreference === "platform"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Store className={`w-5 h-5 ${sellingPreference === "platform" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${sellingPreference === "platform" ? "text-primary" : "text-foreground"}`}>
                    Sell via Platform
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Platform handles sales, logistics, marketing. You earn net profit after deductions.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSellingPreference("collect")}
                className={`rounded-lg p-4 border-2 text-left transition-all ${
                  sellingPreference === "collect"
                    ? "border-accent-foreground bg-accent/50 shadow-sm"
                    : "border-border hover:border-accent-foreground/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <PackageCheck className={`w-5 h-5 ${sellingPreference === "collect" ? "text-accent-foreground" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${sellingPreference === "collect" ? "text-accent-foreground" : "text-foreground"}`}>
                    Take Delivery
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Collect your units and sell independently. No logistics, marketing, or commission fees.
                </p>
              </button>
            </div>
          </div>

          {units > 0 && est && indie && investmentAmount >= MINIMUM_PARTICIPATION_BDT && (
            <div className="bg-card rounded-lg p-4 border border-border/50 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Units</span>
                <span className="font-bold text-lg">{est.unitsFinanced}</span>
              </div>

              {/* Dual Profit Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 bg-primary/5 border border-primary/10 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-primary">Option A: Sell via Platform</div>
                  <div className="text-lg font-display font-bold text-primary">৳{est.retailNetProfit.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">{est.retailROI.toFixed(0)}% ROI</div>
                  <div className="space-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <div>Revenue: ৳{est.retailRevenue.toLocaleString()}</div>
                    <div>− Inventory: ৳{est.inventoryCost.toLocaleString()}</div>
                    <div>− Logistics: ৳{est.logisticsCost.toLocaleString()}</div>
                    <div>− Marketing: ৳{est.marketingCost.toLocaleString()}</div>
                    <div>− Commission: ৳{est.retailCommission.toLocaleString()}</div>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-accent/50 border border-accent-foreground/10 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-accent-foreground">Option B: Take Delivery</div>
                  <div className="text-lg font-display font-bold text-accent-foreground">৳{indie.potentialProfit.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">{indie.potentialROI.toFixed(0)}% ROI</div>
                  <div className="space-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <div>Potential Revenue: ৳{indie.potentialRevenue.toLocaleString()}</div>
                    <div>− Inventory: ৳{indie.inventoryCost.toLocaleString()}</div>
                    <div className="text-accent-foreground font-medium">No logistics/marketing/fee</div>
                  </div>
                </div>
              </div>

              {/* Scenario Cards */}
              <div className="border-t border-border/50 pt-3 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Platform Sale Scenarios</span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">15% commission</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { label: "Best Case", rate: 100, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
                    { label: "Expected", rate: 80, color: "text-accent-foreground", bg: "bg-accent/50 border-accent-foreground/20" },
                    { label: "Worst Case", rate: 60, color: "text-destructive", bg: "bg-destructive/5 border-destructive/10" },
                  ] as const).map((s) => {
                    const sc = calcInvestmentEstimate(investmentAmount, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice, logisticsCost, s.rate);
                    const unitsSold = Math.round(sc.unitsFinanced * (s.rate / 100));
                    return (
                      <div key={s.label} className={`rounded-lg p-3 border ${s.bg} space-y-1`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${s.color}`}>{s.label} ({s.rate}%)</span>
                        <div className="text-[10px] text-muted-foreground">{unitsSold}/{sc.unitsFinanced} sold</div>
                        <div className={`text-sm font-display font-bold ${s.color}`}>৳{sc.retailNetProfit.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">{sc.retailROI.toFixed(0)}% ROI</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground border-t border-border/30 mt-2">
                <span>✔ Profit estimate only</span>
                <span>✔ Not guaranteed return</span>
              </div>
            </div>
          )}

          {investmentAmount > 0 && investmentAmount < MINIMUM_PARTICIPATION_BDT && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              Minimum participation is ৳{MINIMUM_PARTICIPATION_BDT.toLocaleString()}
            </div>
          )}
          {units > batch.remainingUnits && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              Only {batch.remainingUnits} units available
            </div>
          )}

          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Wallet Balance</span>
            </div>
            <span className={`font-semibold ${walletBalance < inventoryCost ? "text-destructive" : "text-foreground"}`}>
              ৳{walletBalance.toLocaleString()}
            </span>
          </div>
          {walletBalance < inventoryCost && inventoryCost > 0 && (
            <div className="flex items-center justify-between bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm">
              <span className="text-destructive">Insufficient balance — need ৳{(inventoryCost - walletBalance).toLocaleString()} more</span>
              <Link to="/wallet" onClick={() => onOpenChange(false)}>
                <Button size="sm" variant="outline" className="text-xs h-7">Deposit</Button>
              </Link>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={!isValid || joinBatch.isPending || walletBalance < inventoryCost} className="w-full" size="lg">
            {joinBatch.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {sellingPreference === "platform" ? <Store className="w-4 h-4 mr-2" /> : <PackageCheck className="w-4 h-4 mr-2" />}
            Confirm — ৳{inventoryCost.toLocaleString()} · {units} units · {sellingPreference === "platform" ? "Platform" : "Independent"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By proceeding, you agree to the inventory financing partnership terms.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinBatchDialog;
