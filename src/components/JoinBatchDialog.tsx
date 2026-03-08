import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, TrendingUp, Loader2, Wallet } from "lucide-react";
import { ProductionBatch, MINIMUM_PARTICIPATION_BDT, PLATFORM_COMMISSION_RATE, calculateUnitsFromInvestment } from "@/types/batch";
import { useJoinBatch } from "@/hooks/useJoinBatch";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface JoinBatchDialogProps {
  batch: ProductionBatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function calcJoinEstimate(
  units: number,
  costPerUnit: number,
  wholesalePrice: number,
  retailPrice: number,
  logisticsCostPerUnit: number
) {
  const totalCost = units * costPerUnit;
  const totalLogistics = units * logisticsCostPerUnit;
  const totalCostWithLogistics = totalCost + totalLogistics;

  const wholesaleRevenue = units * wholesalePrice;
  const wholesaleGrossProfit = wholesaleRevenue - totalCostWithLogistics;
  const wholesaleCommission = wholesaleGrossProfit > 0 ? Math.round(wholesaleGrossProfit * PLATFORM_COMMISSION_RATE) : 0;
  const wholesaleNetProfit = wholesaleGrossProfit - wholesaleCommission;
  const wholesaleROI = totalCost > 0 ? (wholesaleNetProfit / totalCost) * 100 : 0;

  const retailRevenue = units * retailPrice;
  const retailGrossProfit = retailRevenue - totalCostWithLogistics;
  const retailCommission = retailGrossProfit > 0 ? Math.round(retailGrossProfit * PLATFORM_COMMISSION_RATE) : 0;
  const retailNetProfit = retailGrossProfit - retailCommission;
  const retailROI = totalCost > 0 ? (retailNetProfit / totalCost) * 100 : 0;

  return {
    totalCost,
    totalLogistics,
    totalCostWithLogistics,
    wholesaleRevenue,
    wholesaleGrossProfit,
    wholesaleNetProfit,
    wholesaleROI,
    retailRevenue,
    retailGrossProfit,
    retailNetProfit,
    retailROI,
  };
}

const JoinBatchDialog = ({ batch, open, onOpenChange }: JoinBatchDialogProps) => {
  const [investmentInput, setInvestmentInput] = useState(MINIMUM_PARTICIPATION_BDT.toString());
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const joinBatch = useJoinBatch();
  const walletBalance = wallet?.balance || 0;

  const investmentAmount = Number(investmentInput) || 0;
  const { units, totalCost, unusedAmount } = calculateUnitsFromInvestment(investmentAmount, batch.productionCostPerUnit);
  const logisticsCost = batch.logisticsCostPerUnit || 0;
  const est = units > 0 ? calcJoinEstimate(units, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice, logisticsCost) : null;
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
        totalInvested: totalCost,
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
            </div>
            <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2 text-left border border-primary/10">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventory Cost</span>
                <span className="font-semibold">৳{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units Financed</span>
                <span className="font-semibold">{units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Retail Net Profit</span>
                <span className="font-semibold text-primary">৳{est?.retailNetProfit.toLocaleString()}</span>
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
            <Label htmlFor="investment">Financing Amount (BDT)</Label>
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

          {units > 0 && est && (
            <div className="bg-card rounded-lg p-4 border border-border/50 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units Financed (FLOOR)</span>
                <span className="font-bold text-lg">{units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventory Purchase Cost</span>
                <span className="font-semibold">৳{totalCost.toLocaleString()}</span>
              </div>
              {unusedAmount > 0 && (
                <div className="flex justify-between text-xs bg-accent/30 rounded px-2 py-1.5 border border-accent-foreground/10">
                  <span className="text-accent-foreground font-medium">Unused amount returned</span>
                  <span className="font-mono font-bold text-accent-foreground">৳{unusedAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Logistics Cost ({units} × ৳{logisticsCost})</span>
                <span>৳{est.totalLogistics.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost (Inventory + Logistics)</span>
                <span className="font-semibold">৳{est.totalCostWithLogistics.toLocaleString()}</span>
              </div>

              <div className="border-t border-border/50 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Net Profit Estimates</span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">15% commission</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wholesale (৳{batch.wholesalePrice}/unit)</span>
                  <span className={`font-semibold ${est.wholesaleNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                    ৳{est.wholesaleNetProfit.toLocaleString()}
                    <span className="text-xs ml-1">({est.wholesaleROI.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retail (৳{batch.retailPrice}/unit)</span>
                  <span className={`font-semibold ${est.retailNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                    ৳{est.retailNetProfit.toLocaleString()}
                    <span className="text-xs ml-1">({est.retailROI.toFixed(0)}%)</span>
                  </span>
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
            <span className={`font-semibold ${walletBalance < totalCost ? "text-destructive" : "text-foreground"}`}>
              ৳{walletBalance.toLocaleString()}
            </span>
          </div>
          {walletBalance < totalCost && totalCost > 0 && (
            <div className="flex items-center justify-between bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm">
              <span className="text-destructive">Insufficient balance — need ৳{(totalCost - walletBalance).toLocaleString()} more</span>
              <Link to="/wallet" onClick={() => onOpenChange(false)}>
                <Button size="sm" variant="outline" className="text-xs h-7">Deposit</Button>
              </Link>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={!isValid || joinBatch.isPending || walletBalance < totalCost} className="w-full" size="lg">
            {joinBatch.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirm Financing — ৳{totalCost.toLocaleString()} for {units} units
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
