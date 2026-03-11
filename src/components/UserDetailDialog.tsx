import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Loader2, ArrowUpRight, ArrowDownRight, ShoppingCart, Wallet } from "lucide-react";
import { AdminUser, useToggleUserRole } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

const roleColors: Record<string, string> = {
  partner: "bg-primary/10 text-primary",
  dropshipper: "bg-accent text-accent-foreground",
  distributor: "bg-secondary text-secondary-foreground",
  admin: "bg-destructive/10 text-destructive",
  warehouse: "bg-secondary text-secondary-foreground",
};

const userStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent text-accent-foreground",
  suspended: "bg-destructive/10 text-destructive",
};

const txnTypeColors: Record<string, string> = {
  deposit: "text-primary",
  investment: "text-accent-foreground",
  profit: "text-primary",
  commission: "text-primary",
  withdrawal: "text-destructive",
  bonus: "text-primary",
};

const txnTypeIcons: Record<string, "in" | "out"> = {
  deposit: "in",
  profit: "in",
  commission: "in",
  bonus: "in",
  investment: "out",
  withdrawal: "out",
};

const orderStatusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

interface UserDetailDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (user: AdminUser) => void;
}

function useUserTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-user-transactions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

function useUserOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-user-orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export default function UserDetailDialog({ user, open, onOpenChange, onUserUpdate }: UserDetailDialogProps) {
  const { toast } = useToast();
  const toggleUserRole = useToggleUserRole();
  const { data: transactions = [], isLoading: loadingTxns } = useUserTransactions(user?.id);
  const { data: orders = [], isLoading: loadingOrders } = useUserOrders(user?.id);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {user.name.charAt(0).toLowerCase()}
              </div>
            )}
            <div>
              <DialogTitle>{user.name}</DialogTitle>
              <DialogDescription>Manage user details and role</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 mt-0">
              {(user.phone || user.address) && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-[10px] text-muted-foreground uppercase">Roles</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.roles.map((r) => (
                      <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[r] || ""}`}>
                        {r === "dropshipper" ? "sales partner" : r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-[10px] text-muted-foreground uppercase">Status</div>
                  <div className="mt-1"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${userStatusColors[user.status]}`}>{user.status}</span></div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-[10px] text-muted-foreground uppercase">Wallet</div>
                  <div className="text-sm font-bold mt-1">৳{user.walletBalance.toLocaleString()}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-[10px] text-muted-foreground uppercase">Joined</div>
                  <div className="text-sm font-medium mt-1">{user.joined}</div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Invested</span>
                  <span className="font-semibold">৳{user.totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Earned</span>
                  <span className="font-bold text-primary">৳{user.totalEarned.toLocaleString()}</span>
                </div>
              </div>

              {/* Role Management */}
              <div className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Manage Roles</div>
                <p className="text-[11px] text-muted-foreground">Toggle roles on/off. Users must have at least one role.</p>
                <div className="space-y-2">
                  {(["partner", "dropshipper", "distributor", "warehouse", "admin"] as const).map((r) => {
                    const hasRole = user.roles.includes(r);
                    const isOnlyRole = hasRole && user.roles.length === 1;
                    const displayName = r === "dropshipper" ? "Sales Partner" : r === "partner" ? "Production Partner" : r === "warehouse" ? "Warehouse Manager" : r.charAt(0).toUpperCase() + r.slice(1);
                    return (
                      <div key={r} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${hasRole ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          <span className="text-sm font-medium">{displayName}</span>
                        </div>
                        <Button
                          variant={hasRole ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs px-3"
                          disabled={toggleUserRole.isPending || isOnlyRole}
                          onClick={async () => {
                            try {
                              await toggleUserRole.mutateAsync({
                                userId: user.id,
                                role: r,
                                action: hasRole ? "remove" : "add",
                              });
                              const newRoles = hasRole
                                ? user.roles.filter((x) => x !== r)
                                : [...user.roles, r];
                              onUserUpdate({ ...user, roles: newRoles, role: newRoles[0] });
                              toast({
                                title: hasRole ? "Role Removed" : "Role Added",
                                description: `${displayName} ${hasRole ? "removed from" : "added to"} ${user.name}`,
                              });
                            } catch (e: any) {
                              toast({ title: "Failed", description: e.message, variant: "destructive" });
                            }
                          }}
                        >
                          {toggleUserRole.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : hasRole ? "Remove" : "Add"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-0">
              {loadingTxns ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No transactions found</div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">Showing last {transactions.length} transactions</p>
                  {transactions.map((txn: any) => {
                    const isIncome = txnTypeIcons[txn.type] === "in";
                    return (
                      <div key={txn.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isIncome ? "bg-primary/10" : "bg-destructive/10"}`}>
                            {isIncome ? <ArrowDownRight className="w-3.5 h-3.5 text-primary" /> : <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />}
                          </div>
                          <div>
                            <div className="text-xs font-medium capitalize">{txn.type}</div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{txn.description || "—"}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-bold ${txnTypeColors[txn.type] || ""}`}>
                            {isIncome ? "+" : "-"}৳{Number(txn.amount).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(txn.created_at).toLocaleDateString()}
                          </div>
                          <Badge variant={txn.status === "completed" ? "default" : txn.status === "failed" ? "destructive" : "secondary"} className="text-[9px] px-1.5 py-0 mt-0.5">
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-0">
              {loadingOrders ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No orders found</div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">Showing last {orders.length} orders</p>
                  {orders.map((order: any) => (
                    <div key={order.id} className="rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold">{order.order_number}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${orderStatusColors[order.status] || ""}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{order.customer_name}</span>
                        <span className="font-bold">৳{Number(order.total_amount).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{order.channel}</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      {order.commission > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                          <Wallet className="w-3 h-3" />
                          Commission: ৳{Number(order.commission).toLocaleString()}
                        </div>
                      )}
                      {order.tracking_number && (
                        <div className="text-[10px] text-muted-foreground">
                          Tracking: {order.tracking_number}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
