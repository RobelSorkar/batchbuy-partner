import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { useAdminWithdrawals, useUpdateTransactionStatus } from "@/hooks/useAdminData";
import { withdrawStatusColors } from "./adminStyles";

type Withdrawal = NonNullable<ReturnType<typeof useAdminWithdrawals>["data"]>[number];

interface AdminWithdrawalsTabProps {
  withdrawals: Withdrawal[];
}

const AdminWithdrawalsTab = ({ withdrawals }: AdminWithdrawalsTabProps) => {
  const { toast } = useToast();
  const updateTxnStatus = useUpdateTransactionStatus();

  const processWithdrawal = async (id: string, action: "completed" | "failed") => {
    try {
      await updateTxnStatus.mutateAsync({ id, status: action });
      toast({
        title: action === "completed" ? "Withdrawal Approved" : "Withdrawal Rejected",
        variant: action === "failed" ? "destructive" : undefined,
      });
    } catch (e) {
      toast({ title: "Error", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="p-5 border-b border-border/50">
        <h2 className="font-display font-semibold text-lg">Withdrawal Requests</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {["ID", "Amount", "Description", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4 text-sm font-mono">{w.id.slice(0, 8)}</td>
                <td className="px-5 py-4 text-sm font-bold">৳{Number(w.amount).toLocaleString()}</td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{w.description || "—"}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${withdrawStatusColors[w.status] || ""}`}>{w.status}</span></td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  {w.status === "pending" ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-primary h-7 text-xs" onClick={() => processWithdrawal(w.id, "completed")}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => processWithdrawal(w.id, "failed")}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {withdrawals.length === 0 && <div className="p-8 text-center text-muted-foreground">No withdrawal requests.</div>}
    </div>
  );
};

export default AdminWithdrawalsTab;
