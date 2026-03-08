import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BatchRow {
  id: string;
  product_name: string;
  batch_name: string;
  production_cost_per_unit: number;
  wholesale_price: number;
  retail_price: number;
  total_quantity: number;
  remaining_units: number;
  funded_units: number;
  status: string;
  min_participation: number;
  category: string | null;
  description: string | null;
  manufacturer: string | null;
  warehouse: string | null;
  production_time_days: number | null;
  deadline: string | null;
  image: string | null;
  partners_joined: number;
  created_at: string;
  created_by: string | null;
}

export function useBatches() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("batches-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "batches" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["batches"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BatchRow[];
    },
  });
}

export function useBatchDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["batch", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as BatchRow;
    },
    enabled: !!id,
  });
}

export function useBatchParticipations(batchId: string | undefined) {
  return useQuery({
    queryKey: ["batch-participations", batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const { data, error } = await supabase
        .from("batch_participations")
        .select("*, profiles:user_id(full_name)")
        .eq("batch_id", batchId)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
}

export function useMyParticipations() {
  return useQuery({
    queryKey: ["my-participations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("batch_participations")
        .select("*, batches(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
}
