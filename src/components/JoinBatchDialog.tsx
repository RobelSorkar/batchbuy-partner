import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { ProductionBatch, MINIMUM_PARTICIPATION_BDT, calculateUnitsFromInvestment, calculateProfitEstimate } from "@/types/batch";

interface JoinBatchDialogProps {
  batch: ProductionBatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinBatchDialog = ({ batch, open, onOpenChange }: JoinBatchDialogProps) => {
  const [investmentInput, setInvestmentInput] = useState(MINIMUM_PARTICIPATION_BDT.toString());
  const [submitted, setSubmitted] = useState(false);

  const investmentAmount = Number(investmentInput) || 0;
  const { units, totalCost, remainder } = calculateUnitsFromInvestment(investmentAmount, batch.productionCostPerUnit);
  const { investment, revenue, profit, returnPct } = calculateProfitEstimate(units, batch.productionCostPerUnit, batch.retailPrice);
  const isValid = investmentAmount >= MINIMUM_PARTICIPATION_BDT && units > 0 && units <= batch.remainingUnits;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
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
                You now own <span className="font-semibold text-foreground">{units} units</span> of{" "}
                <span className="font-semibold text-foreground">{batch.productName}</span>
              </p>
            </div>
            <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2 text-left border border-primary/10">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investment</span>
                <span className="font-semibold">৳{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units Owned</span>
                <span className="font-semibold">{units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Retail Profit</span>
                <span className="font-semibold text-primary">৳{profit.toLocaleString()}</span>
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
          {/* Batch Summary */}
          <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Cost/Unit</div>
              <div className="text-sm font-semibold">৳{batch.productionCostPerUnit}</div>
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

          {/* Investment Input */}
          <div className="space-y-2">
            <Label htmlFor="investment">Investment Amount (BDT)</Label>
            <Input
              id="investment"
              type="number"
              min={MINIMUM_PARTICIPATION_BDT}
              step={batch.productionCostPerUnit}
              value={investmentInput}
              onChange={(e) => setInvestmentInput(e.target.value)}
              className="text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: ৳{MINIMUM_PARTICIPATION_BDT.toLocaleString()} · Available: {batch.remainingUnits} units
            </p>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[10000, 20000, 50000, 100000].map((amt) => (
              <Button
                key={amt}
                type="button"
                variant={investmentAmount === amt ? "default" : "outline"}
                size="sm"
                onClick={() => setInvestmentInput(amt.toString())}
              >
                ৳{(amt / 1000).toFixed(0)}K
              </Button>
            ))}
          </div>

          {/* Calculator Results */}
          {units > 0 && (
            <div className="bg-card rounded-lg p-4 border border-border/50 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units You'll Own</span>
                <span className="font-bold text-lg">{units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual Cost</span>
                <span className="font-semibold">৳{totalCost.toLocaleString()}</span>
              </div>
              {remainder > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Unused amount (returned)</span>
                  <span>৳{remainder.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-border/50 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Profit Estimates</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">If sold at wholesale</span>
                  <span className="font-semibold text-primary">
                    ৳{(units * (batch.wholesalePrice - batch.productionCostPerUnit)).toLocaleString()}
                    <span className="text-xs ml-1">
                      ({((batch.wholesalePrice - batch.productionCostPerUnit) / batch.productionCostPerUnit * 100).toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">If sold at retail</span>
                  <span className="font-semibold text-primary">
                    ৳{profit.toLocaleString()}
                    <span className="text-xs ml-1">({returnPct.toFixed(0)}%)</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation */}
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

          <Button onClick={handleSubmit} disabled={!isValid} className="w-full" size="lg">
            Confirm Investment — ৳{totalCost.toLocaleString()} for {units} units
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By investing, you agree to the production partnership terms.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinBatchDialog;
