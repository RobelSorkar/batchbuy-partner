import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, AlertCircle, TrendingUp, Loader2, Wallet,
  Store, PackageCheck, ChevronRight, Coins, ArrowRight, CreditCard, X,
} from "lucide-react";
import { ProductionBatch } from "@/types/batch";
import {
  MINIMUM_PARTICIPATION_BDT,
  allocateUnits,
  calcInvestmentEstimate,
  calcIndependentEstimate,
} from "@/lib/calculations";
import { useJoinBatch, SellingPreference } from "@/hooks/useJoinBatch";
import { useAuth } from "@/hooks/useAuth";
import { useWallet, useDeposit } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface JoinBatchDialogProps {
  batch: ProductionBatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [10000, 20000, 50000, 100000];

const SCENARIOS = [
  { label: "Best", rate: 100, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
  { label: "Expected", rate: 80, color: "text-accent-foreground", bg: "bg-accent/50 border-accent-foreground/15" },
] as const;

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ step, current }: { step: number; current: number }) => {
  const done = current > step;
  const active = current === step;
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
      done    ? "bg-primary border-primary text-primary-foreground" :
      active  ? "bg-background border-primary text-primary" :
                "bg-muted border-border text-muted-foreground"
    }`}>
      {done ? <CheckCircle className="w-3.5 h-3.5" /> : step}
    </div>
  );
};

const JoinBatchDialog = ({ batch, open, onOpenChange }: JoinBatchDialogProps) => {
  const [investmentInput, setInvestmentInput] = useState(MINIMUM_PARTICIPATION_BDT.toString());
  const [sellingPreference, setSellingPreference] = useState<SellingPreference>("platform");
  const [submitted, setSubmitted] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const joinBatch = useJoinBatch();
  const deposit = useDeposit();
  const walletBalance = wallet?.balance || 0;

  const investmentAmount = Number(investmentInput) || 0;
  const logisticsCost = batch.logisticsCostPerUnit || 0;

  const { units, inventoryCost, unusedAmount } = allocateUnits(investmentAmount, batch.productionCostPerUnit);
  const est = units > 0
    ? calcInvestmentEstimate(investmentAmount, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice, logisticsCost)
    : null;
  const indie = units > 0
    ? calcIndependentEstimate(investmentAmount, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice)
    : null;

  const belowMin = investmentAmount > 0 && investmentAmount < MINIMUM_PARTICIPATION_BDT;
  const overUnits = units > batch.remainingUnits;
  const insufficientBalance = walletBalance < inventoryCost && inventoryCost > 0;
  const isValid = investmentAmount >= MINIMUM_PARTICIPATION_BDT && units > 0 && !overUnits && !insufficientBalance;

  // derive current visible step for the indicator
  const currentStep = belowMin || investmentAmount === 0 ? 1 : 2;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to join a batch.", variant: "destructive" });
      return;
    }
    try {
      await joinBatch.mutateAsync({ batchId: batch.id, units, totalInvested: inventoryCost, sellingPreference });
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
      setShowDeposit(false);
      setDepositAmount("");
      setAccountNumber("");
    }, 300);
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 500) {
      toast({ title: "Invalid amount", description: "Minimum deposit is ৳500", variant: "destructive" });
      return;
    }
    if (!accountNumber.trim()) {
      toast({ title: "Account required", description: "Please enter your payment account number", variant: "destructive" });
      return;
    }
    try {
      await deposit.mutateAsync({ amount, method: paymentMethod, account: accountNumber });
      toast({ title: "Deposit successful", description: `৳${amount.toLocaleString()} added to your wallet` });
      setShowDeposit(false);
      setDepositAmount("");
      setAccountNumber("");
    } catch (error: any) {
      toast({ title: "Deposit failed", description: error.message, variant: "destructive" });
    }
  };

  // ─── Success screen ──────────────────────────────────────────────────────────
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
              <p className="text-muted-foreground text-sm mt-1">
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
              <div className="border-t border-border/30 pt-2 mt-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Platform Sale Profit</span>
                  <span className="font-semibold text-primary">৳{est?.retailNetProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Independent Sale Potential</span>
                  <span className="font-semibold text-accent-foreground">৳{indie?.potentialProfit.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">✔ Estimate only · ✔ Not guaranteed</p>
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Main dialog ─────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-display text-xl">Join Production Batch</DialogTitle>
          <DialogDescription>{batch.batchName}</DialogDescription>
        </DialogHeader>

        {/* Batch quick-stats */}
        <div className="bg-muted/50 rounded-lg px-4 py-3 grid grid-cols-4 gap-2 text-center text-sm border border-border/40">
          {[
            { label: "Cost/Unit", value: `৳${batch.productionCostPerUnit}` },
            { label: "Logistics", value: `৳${logisticsCost}` },
            { label: "Wholesale", value: `৳${batch.wholesalePrice}` },
            { label: "Retail", value: `৳${batch.retailPrice}` },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[10px] text-muted-foreground mb-0.5">{s.label}</div>
              <div className="font-semibold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6 pt-1">

          {/* ── STEP 1: Investment ────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StepIndicator step={1} current={1} />
              <div>
                <p className="text-sm font-semibold text-foreground">Choose Investment Amount</p>
                <p className="text-[11px] text-muted-foreground">Minimum ৳{MINIMUM_PARTICIPATION_BDT.toLocaleString()}</p>
              </div>
            </div>

            <div className="pl-10 space-y-3">
              {/* Preset buttons */}
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestmentInput(amt.toString())}
                    className={`h-9 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${
                      investmentAmount === amt
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    ৳{(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">৳</span>
                <Input
                  type="number"
                  min={MINIMUM_PARTICIPATION_BDT}
                  step={batch.productionCostPerUnit}
                  value={investmentInput}
                  onChange={(e) => setInvestmentInput(e.target.value)}
                  className="pl-7 text-base font-semibold"
                  placeholder="Enter amount..."
                />
              </div>

              {/* Unit output pill */}
              {units > 0 && !belowMin && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-lg px-4 py-2.5">
                  <Coins className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">You get</span>
                  <span className="text-base font-display font-bold text-primary">{units} units</span>
                  <span className="text-sm text-muted-foreground ml-auto">Inv. cost: ৳{inventoryCost.toLocaleString()}</span>
                </div>
              )}
              {unusedAmount > 0 && units > 0 && (
                <p className="text-[10px] text-muted-foreground">৳{unusedAmount.toLocaleString()} unused (rounds up to full units)</p>
              )}

              {/* Errors */}
              {belowMin && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Minimum is ৳{MINIMUM_PARTICIPATION_BDT.toLocaleString()}
                </div>
              )}
              {overUnits && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Only {batch.remainingUnits} units available
                </div>
              )}
            </div>
          </div>

          {/* ── STEP 2: Selling option (only when step 1 valid) ────────────── */}
          {units > 0 && !belowMin && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StepIndicator step={2} current={2} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Choose Selling Option</p>
                  <p className="text-[11px] text-muted-foreground">How would you like to sell your units?</p>
                </div>
              </div>

              <div className="pl-10 grid grid-cols-2 gap-3">
                {/* Option A */}
                <button
                  type="button"
                  onClick={() => setSellingPreference("platform")}
                  className={`rounded-xl p-4 border-2 text-left transition-all group ${
                    sellingPreference === "platform"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 bg-background"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    sellingPreference === "platform" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-bold mb-1 ${sellingPreference === "platform" ? "text-primary" : "text-foreground"}`}>
                    Sell via Platform
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Platform handles sales, logistics & marketing. Earn net profit after all fees.
                  </p>
                  {sellingPreference === "platform" && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <CheckCircle className="w-3 h-3" /> Selected
                    </div>
                  )}
                </button>

                {/* Option B */}
                <button
                  type="button"
                  onClick={() => setSellingPreference("collect")}
                  className={`rounded-xl p-4 border-2 text-left transition-all group ${
                    sellingPreference === "collect"
                      ? "border-accent-foreground bg-accent/50 shadow-sm"
                      : "border-border hover:border-accent-foreground/30 bg-background"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    sellingPreference === "collect" ? "bg-accent-foreground text-background" : "bg-muted text-muted-foreground"
                  }`}>
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-bold mb-1 ${sellingPreference === "collect" ? "text-accent-foreground" : "text-foreground"}`}>
                    Take Delivery
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Collect your units and sell independently. No logistics, marketing, or commission.
                  </p>
                  {sellingPreference === "collect" && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-accent-foreground">
                      <CheckCircle className="w-3 h-3" /> Selected
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Profit comparison (only when step 1 valid) ────────── */}
          {units > 0 && !belowMin && est && indie && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StepIndicator step={3} current={3} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Profit Comparison</p>
                  <p className="text-[11px] text-muted-foreground">Estimated returns for {units} units</p>
                </div>
              </div>

              <div className="pl-10 space-y-3">
                {/* Side-by-side option profits */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Option A card */}
                  <div className={`rounded-xl p-4 border-2 space-y-2 transition-all ${
                    sellingPreference === "platform"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 opacity-60"
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Option A</div>
                    <div className="text-xl font-display font-bold text-primary">
                      ৳{est.retailNetProfit.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{est.retailROI.toFixed(0)}% ROI (retail)</div>
                    <div className="space-y-0.5 text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                      <div className="flex justify-between"><span>Revenue</span><span>৳{est.retailRevenue.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>− Inventory</span><span>৳{est.inventoryCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>− Logistics</span><span>৳{est.logisticsCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>− Marketing</span><span>৳{est.marketingCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>− Commission</span><span>৳{est.retailCommission.toLocaleString()}</span></div>
                    </div>
                  </div>

                  {/* Option B card */}
                  <div className={`rounded-xl p-4 border-2 space-y-2 transition-all ${
                    sellingPreference === "collect"
                      ? "border-accent-foreground bg-accent/50"
                      : "border-border bg-muted/30 opacity-60"
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Option B</div>
                    <div className="text-xl font-display font-bold text-accent-foreground">
                      ৳{indie.potentialProfit.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{indie.potentialROI.toFixed(0)}% ROI (potential)</div>
                    <div className="space-y-0.5 text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                      <div className="flex justify-between"><span>Revenue</span><span>৳{indie.potentialRevenue.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>− Inventory</span><span>৳{indie.inventoryCost.toLocaleString()}</span></div>
                      <div className="text-accent-foreground font-semibold">No logistics / fees</div>
                    </div>
                  </div>
                </div>

                {/* Platform sale scenarios — only if Option A selected */}
                {sellingPreference === "platform" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium text-foreground">Platform Sale Scenarios</span>
                      <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">15% commission</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SCENARIOS.map((s) => {
                        const sc = calcInvestmentEstimate(investmentAmount, batch.productionCostPerUnit, batch.wholesalePrice, batch.retailPrice, logisticsCost, s.rate);
                        const unitsSold = Math.round(sc.unitsFinanced * (s.rate / 100));
                        const remainingUnits = sc.unitsFinanced - unitsSold;
                        const inventoryAssetValue = remainingUnits * batch.productionCostPerUnit;
                        const showAsset = s.rate < 100 && remainingUnits > 0;

                        return (
                          <div key={s.label} className={`rounded-lg p-3 border ${s.bg} space-y-1`}>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</div>
                            {showAsset ? (
                              <>
                                <div className="text-[10px] text-muted-foreground">{unitsSold} sold · {remainingUnits} remaining</div>
                                <div className="text-[10px] text-muted-foreground">Inventory: <span className="font-semibold text-accent-foreground">৳{inventoryAssetValue.toLocaleString()}</span></div>
                                <div className={`text-sm font-display font-bold ${(sc.retailNetProfit + inventoryAssetValue) >= 0 ? "text-primary" : s.color}`}>
                                  ৳{(sc.retailNetProfit + inventoryAssetValue).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-muted-foreground">total value</div>
                              </>
                            ) : (
                              <>
                                <div className="text-[10px] text-muted-foreground">{unitsSold}/{sc.unitsFinanced} sold</div>
                                <div className={`text-sm font-display font-bold ${s.color}`}>৳{sc.retailNetProfit.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">{sc.retailROI.toFixed(0)}% ROI</div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground">✔ Estimates only · ✔ Not guaranteed returns</p>
              </div>
            </div>
          )}

          {/* ── Wallet row ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 text-sm border border-border/40">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              Wallet Balance
            </div>
            <span className={`font-semibold ${insufficientBalance ? "text-destructive" : "text-foreground"}`}>
              ৳{walletBalance.toLocaleString()}
            </span>
          </div>
          {insufficientBalance && !showDeposit && (
            <div className="flex items-center justify-between bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3 text-sm">
              <span className="text-destructive text-xs">Need ৳{(inventoryCost - walletBalance).toLocaleString()} more</span>
              <Button size="sm" variant="default" onClick={() => setShowDeposit(true)} className="text-xs h-7">
                <CreditCard className="w-3 h-3 mr-1" /> Top Up
              </Button>
            </div>
          )}

          {/* ── Inline deposit panel ────────────────────────────────────── */}
          {showDeposit && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 relative">
              <button
                onClick={() => setShowDeposit(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Quick Deposit</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">Add funds instantly to complete your investment</p>

              {/* Preset amounts */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Deposit Amount</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    (inventoryCost - walletBalance),
                    5000,
                    10000,
                    20000,
                  ].filter((amt, idx, arr) => amt >= 500 && arr.indexOf(amt) === idx).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        Number(depositAmount) === amt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      ৳{(amt / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Custom amount..."
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="text-sm"
                  min={500}
                />
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "bkash", label: "bKash" },
                    { id: "nagad", label: "Nagad" },
                    { id: "rocket", label: "Rocket" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        paymentMethod === m.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account number */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Account Number</Label>
                <Input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleDeposit}
                disabled={deposit.isPending || !depositAmount || Number(depositAmount) < 500 || !accountNumber.trim()}
                className="w-full"
                size="sm"
              >
                {deposit.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CreditCard className="w-3 h-3 mr-1" />}
                Deposit ৳{Number(depositAmount || 0).toLocaleString()}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                Auto-credited for testing · In production, payment verification applies
              </p>
            </div>
          )}

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || joinBatch.isPending}
            className="w-full"
            size="lg"
          >
            {joinBatch.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : sellingPreference === "platform" ? (
              <Store className="w-4 h-4" />
            ) : (
              <PackageCheck className="w-4 h-4" />
            )}
            {isValid
              ? `Confirm — ৳${inventoryCost.toLocaleString()} · ${units} units · ${sellingPreference === "platform" ? "Platform" : "Independent"}`
              : "Enter a valid investment amount"}
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
