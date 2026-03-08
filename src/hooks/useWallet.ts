import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useWallet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useWithdraw() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, method, account }: { amount: number; method: string; account: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Create transaction
      const { error: txnError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount,
        description: `Withdrawal to ${method} — ${account}`,
        status: "processing",
      });
      if (txnError) throw txnError;

      // Deduct from wallet
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single();
      if (!wallet) throw new Error("Wallet not found");

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: wallet.balance - amount })
        .eq("user_id", user.id);
      if (walletError) throw walletError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useReinvest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, batchName, amount, units }: { batchId: string; batchName: string; amount: number; units: number }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("join_batch", {
        p_batch_id: batchId,
        p_units: units,
        p_total_invested: amount,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["my-participations"] });
    },
  });
}
