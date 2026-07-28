import { AdminUser } from "@/hooks/useAdminData";
import { roleColors } from "./adminStyles";

interface AdminWalletsTabProps {
  users: AdminUser[];
  totalWalletBalance: number;
  totalInvested: number;
  totalEarned: number;
}

const AdminWalletsTab = ({ users, totalWalletBalance, totalInvested, totalEarned }: AdminWalletsTabProps) => {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="p-5 border-b border-border/50">
        <h2 className="font-display font-semibold text-lg">User Wallets</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {["User", "Role", "Balance", "Total Invested", "Total Earned"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.filter((u) => u.role !== "admin").map((user) => (
              <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{user.name.charAt(0)}</div>
                    <div className="text-sm font-medium">{user.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[user.role] || ""}`}>{user.role}</span></td>
                <td className="px-5 py-4 text-sm font-bold">৳{user.walletBalance.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm">৳{user.totalInvested.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-primary font-medium">৳{user.totalEarned.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-5 border-t border-border/50 grid grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-xl font-display font-bold">৳{totalWalletBalance.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Balance</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-xl font-display font-bold">৳{totalInvested.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Invested</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <div className="text-xl font-display font-bold text-primary">৳{totalEarned.toLocaleString()}</div>
          <div className="text-xs text-primary">Total Earned</div>
        </div>
      </div>
    </div>
  );
};

export default AdminWalletsTab;
