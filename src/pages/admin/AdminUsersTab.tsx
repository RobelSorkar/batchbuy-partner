import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminUser } from "@/hooks/useAdminData";
import { roleColors, userStatusColors } from "./adminStyles";

interface AdminUsersTabProps {
  users: AdminUser[];
  defaultRoleFilter?: string;
  onSelectUser: (user: AdminUser) => void;
}

const AdminUsersTab = ({ users, defaultRoleFilter, onSelectUser }: AdminUsersTabProps) => {
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState(defaultRoleFilter || "all");

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.roles.includes(userRoleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-border/50 gap-3">
        <h2 className="font-display font-semibold text-lg">User Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-8 h-8 text-xs w-48" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>
          <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
            <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
              <SelectItem value="dropshipper">Sales Partners</SelectItem>
              <SelectItem value="distributor">Distributors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {["User", "Role", "Status", "Joined", "Wallet", "Financed", "Earned", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{user.name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((r) => (
                      <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[r] || ""}`}>
                        {r === "dropshipper" ? "sales" : r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${userStatusColors[user.status]}`}>{user.status}</span></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                <td className="px-5 py-4 text-sm font-medium">৳{user.walletBalance.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">৳{user.totalInvested.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-primary font-medium">৳{user.totalEarned.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <Button variant="ghost" size="sm" onClick={() => onSelectUser(user)}><Eye className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found.</div>}
    </div>
  );
};

export default AdminUsersTab;
