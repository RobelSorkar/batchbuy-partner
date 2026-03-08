import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: string;
  walletBalance: number;
  totalInvested: number;
  totalEarned: number;
}

export function useAdminUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;

      // Get all roles
      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("*");
      if (rErr) throw rErr;

      // Get all wallets
      const { data: wallets, error: wErr } = await supabase
        .from("wallets")
        .select("*");
      if (wErr) throw wErr;

      // Get all transactions
      const { data: transactions, error: tErr } = await supabase
        .from("transactions")
        .select("*");
      if (tErr) throw tErr;

      const roleMap = new Map<string, string>();
      (roles || []).forEach((r: any) => roleMap.set(r.user_id, r.role));

      const walletMap = new Map<string, number>();
      (wallets || []).forEach((w: any) => walletMap.set(w.user_id, Number(w.balance)));

      const investedMap = new Map<string, number>();
      const earnedMap = new Map<string, number>();
      (transactions || []).forEach((t: any) => {
        if (t.type === "investment" || t.type === "reinvestment") {
          investedMap.set(t.user_id, (investedMap.get(t.user_id) || 0) + Number(t.amount));
        }
        if (t.type === "profit" || t.type === "commission") {
          earnedMap.set(t.user_id, (earnedMap.get(t.user_id) || 0) + Number(t.amount));
        }
      });

      return (profiles || []).map((p: any) => ({
        id: p.user_id,
        name: p.full_name || "Unknown",
        email: "", // email from auth not accessible from client
        role: roleMap.get(p.user_id) || "partner",
        joined: new Date(p.created_at).toLocaleDateString(),
        status: "active",
        walletBalance: walletMap.get(p.user_id) || 0,
        totalInvested: investedMap.get(p.user_id) || 0,
        totalEarned: earnedMap.get(p.user_id) || 0,
      })) as AdminUser[];
    },
    enabled: !!user,
  });
}

export function useAdminWithdrawals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      // transactions.user_id has no FK to profiles, so query separately
      const { data: txns, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return txns || [];
    },
    enabled: !!user,
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAllTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin-all-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
