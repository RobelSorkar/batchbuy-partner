import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowUp,
  Clock, CheckCircle, RefreshCw, TrendingUp, Layers, Banknote, Repeat, Loader2
} from "lucide-react";
import { useWallet, useTransactions, useWithdraw, useReinvest, useDeposit } from "@/hooks/useWallet";
import { useBatches } from "@/hooks/useBatches";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { allocateUnits } from "@/lib/calculations";

const withdrawMethods = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank", label: "Bank Transfer" },
];

const categoryIcons: Record<string, string> = {
  profit: "💰", investment: "📦", withdrawal: "🏧", deposit: "💵",
  commission: "🤝", reinvest: "🔄", bonus: "🎁",
};

const categoryFilters = [
  { label: "All", value: "all" },
  { label: "Profits", value: "profit" },
  { label: "Investments", value: "investment" },
  { label: "Deposits", value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Commissions", value: "commission" },
];

const WalletPage = () => {
  const { user } = useAuth();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions = [], isLoading: txnLoading } = useTransactions();
  const { data: batches = [] } = useBatches();
  const withdraw = useWithdraw();
  const reinvest = useReinvest();
  const deposit = useDeposit();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"partner" | "dropshipper" | "admin" | "warehouse" | "distributor">("partner");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const role = data?.[0]?.role;
      if (role === "dropshipper" || role === "admin" || role === "warehouse" || role === "distributor") setUserRole(role);
    });
  }, [user]);

  const [txnFilter, setTxnFilter] = useState("all");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bkash");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [reinvestOpen, setReinvestOpen] = useState(false);
  const [reinvestBatchId, setReinvestBatchId] = useState("");
  const [reinvestAmount, setReinvestAmount] = useState("");
  const [reinvestSuccess, setReinvestSuccess] = useState(false);

  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);
  const balance = wallet?.balance || 0;

  const totalInvested = transactions.filter((t: any) => t.type === "investment" || t.type === "reinvest").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalEarnings = transactions.filter((t: any) => t.type === "profit" || t.type === "commission" || t.type === "bonus").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalWithdrawn = transactions.filter((t: any) => t.type === "withdrawal").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const filteredTxns = txnFilter === "all" ? transactions : transactions.filter((t: any) => t.type === txnFilter);

  const fundingBatches = batches.filter((b: any) => b.status === "funding" && b.remaining_units > 0);
  const selectedBatch = fundingBatches.find((b: any) => b.id === reinvestBatchId);
  const reinvestAmt = Number(reinvestAmount) || 0;
  const { units: reinvestUnits, inventoryCost: reinvestCost } = selectedBatch
    ? allocateUnits(reinvestAmt, selectedBatch.production_cost_per_unit)
    : { units: 0, inventoryCost: 0 };

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (amt <= 0 || amt > balance || !withdrawAccount) return;
    try {
      await withdraw.mutateAsync({ amount: amt, method: withdrawMethod, account: withdrawAccount });
      setWithdrawSuccess(true);
    } catch (e: any) {
      toast({ title: "Withdrawal failed", description: e.message, variant: "destructive" });
    }
  };

  const closeWithdraw = () => {
    setWithdrawOpen(false);
    setTimeout(() => { setWithdrawSuccess(false); setWithdrawAmount(""); setWithdrawAccount(""); }, 300);
  };

  const handleReinvest = async () => {
    if (!selectedBatch || reinvestCost < 10000 || reinvestUnits <= 0 || reinvestCost > balance) return;
    try {
      await reinvest.mutateAsync({ batchId: selectedBatch.id, batchName: selectedBatch.batch_name, amount: reinvestCost, units: reinvestUnits });
      setReinvestSuccess(true);
    } catch (e: any) {
      toast({ title: "Reinvestment failed", description: e.message, variant: "destructive" });
    }
  };

  const closeReinvest = () => {
    setReinvestOpen(false);
    setTimeout(() => { setReinvestSuccess(false); setReinvestAmount(""); setReinvestBatchId(""); }, 300);
  };

  const handleDeposit = async () => {
    const amt = Number(depositAmount);
    if (amt < 500) return;
    try {
      await deposit.mutateAsync({ amount: amt, method: "direct", account: "wallet" });
      setDepositSuccess(true);
    } catch (e: any) {
      toast({ title: "Deposit failed", description: e.message, variant: "destructive" });
    }
  };

  const closeDeposit = () => {
    setDepositOpen(false);
    setTimeout(() => { setDepositSuccess(false); setDepositAmount(""); }, 300);
  };

  if (walletLoading || txnLoading) {
    return <DashboardLayout role={userRole}><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout role={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Partner Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage earnings, withdrawals, and reinvestments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3"><WalletIcon className="w-5 h-5 text-accent-foreground" /></div>
            <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
            <div className="text-3xl font-display font-bold">৳{balance.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3"><Layers className="w-5 h-5 text-accent-foreground" /></div>
            <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
            <div className="text-2xl font-display font-bold">৳{totalInvested.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-accent-foreground" /></div>
            <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
            <div className="text-2xl font-display font-bold">৳{totalEarnings.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3"><Banknote className="w-5 h-5 text-accent-foreground" /></div>
            <div className="text-sm text-muted-foreground mb-1">Total Withdrawn</div>
            <div className="text-2xl font-display font-bold">৳{totalWithdrawn.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="gap-2" variant="outline" onClick={() => setDepositOpen(true)}><ArrowUpRight className="w-4 h-4" /> Deposit Funds</Button>
          <Button className="gap-2" onClick={() => setWithdrawOpen(true)}><ArrowUp className="w-4 h-4" /> Withdraw Funds</Button>
          <Button variant="outline" className="gap-2" onClick={() => setReinvestOpen(true)}><RefreshCw className="w-4 h-4" /> Reinvest Profits</Button>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-border/50 gap-3">
            <h2 className="font-display font-semibold text-lg">Transaction History</h2>
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map((f) => (
                <Button key={f.value} variant={txnFilter === f.value ? "default" : "outline"} size="sm" className="text-xs h-7 px-2.5" onClick={() => setTxnFilter(f.value)}>
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {filteredTxns.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No transactions found</div>}
            {filteredTxns.map((txn: any) => {
              const isCredit = txn.type === "profit" || txn.type === "commission" || txn.type === "bonus" || txn.type === "deposit";
              return (
                <div key={txn.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isCredit ? "bg-primary/10" : "bg-destructive/10"}`}>
                      {categoryIcons[txn.type] || "📋"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{txn.description || txn.type}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{new Date(txn.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          {txn.status === "completed" ? <CheckCircle className="w-3 h-3 text-primary" /> : txn.status === "processing" ? <RefreshCw className="w-3 h-3 text-accent-foreground animate-spin" /> : <Clock className="w-3 h-3 text-muted-foreground" />}
                          <span className="capitalize">{txn.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${isCredit ? "text-primary" : "text-destructive"}`}>
                    {isCredit ? "+" : "-"}৳{Number(txn.amount).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={closeWithdraw}>
        <DialogContent className="sm:max-w-md">
          {withdrawSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-primary" /></div>
              <h2 className="text-xl font-display font-bold">Withdrawal Submitted</h2>
              <p className="text-muted-foreground text-sm">৳{Number(withdrawAmount).toLocaleString()} will be sent to your account. Processing takes 1-3 business days.</p>
              <Button onClick={closeWithdraw} className="w-full">Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Withdraw Funds</DialogTitle>
                <DialogDescription>Transfer funds from your wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground">Available Balance</div>
                  <div className="text-2xl font-display font-bold">৳{balance.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{withdrawMethods.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w-account">Account Number</Label>
                  <Input id="w-account" placeholder={withdrawMethod === "bank" ? "Account number" : "Phone number"} value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w-amount">Amount (BDT)</Label>
                  <Input id="w-amount" type="number" min="100" max={balance} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                </div>
                <Button className="w-full" disabled={!withdrawAccount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance || withdraw.isPending} onClick={handleWithdraw}>
                  {withdraw.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm Withdrawal
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reinvest Dialog */}
      <Dialog open={reinvestOpen} onOpenChange={closeReinvest}>
        <DialogContent className="sm:max-w-md">
          {reinvestSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-primary" /></div>
              <h2 className="text-xl font-display font-bold">Reinvestment Complete</h2>
              <p className="text-muted-foreground text-sm">You've invested ৳{reinvestCost.toLocaleString()} for {reinvestUnits} units.</p>
              <Button onClick={closeReinvest} className="w-full">Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Reinvest Profits</DialogTitle>
                <DialogDescription>Invest wallet balance into an active batch</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground">Available Balance</div>
                  <div className="text-2xl font-display font-bold">৳{balance.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label>Select Batch</Label>
                  <Select value={reinvestBatchId} onValueChange={setReinvestBatchId}>
                    <SelectTrigger><SelectValue placeholder="Choose a batch" /></SelectTrigger>
                    <SelectContent>
                      {fundingBatches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>{b.product_name} — {b.batch_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-amount">Amount (BDT)</Label>
                  <Input id="r-amount" type="number" min="10000" max={balance} value={reinvestAmount} onChange={(e) => setReinvestAmount(e.target.value)} />
                </div>
                {selectedBatch && reinvestUnits > 0 && (
                  <div className="bg-accent/50 rounded-lg p-3 text-sm border border-primary/10">
                    <p>You'll get <span className="font-semibold">{reinvestUnits} units</span> at ৳{selectedBatch.production_cost_per_unit}/unit</p>
                    <p className="text-xs text-muted-foreground">Total: ৳{reinvestCost.toLocaleString()}</p>
                  </div>
                )}
                <Button className="w-full" disabled={!selectedBatch || reinvestUnits <= 0 || reinvestAmt > balance || reinvest.isPending} onClick={handleReinvest}>
                  {reinvest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm Reinvestment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={closeDeposit}>
        <DialogContent className="sm:max-w-md">
          {depositSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-primary" /></div>
              <h2 className="text-xl font-display font-bold">Deposit Successful</h2>
              <p className="text-muted-foreground text-sm">৳{Number(depositAmount).toLocaleString()} has been added to your wallet.</p>
              <Button onClick={closeDeposit} className="w-full">Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Deposit Funds</DialogTitle>
                <DialogDescription>Add funds to your wallet balance</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="d-amount">Amount (BDT)</Label>
                  <Input id="d-amount" type="number" min="500" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Minimum deposit: ৳500</p>
                </div>
                <Button className="w-full" disabled={Number(depositAmount) < 500 || deposit.isPending} onClick={handleDeposit}>
                  {deposit.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add ৳{Number(depositAmount || 0).toLocaleString()} to Wallet
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WalletPage;
