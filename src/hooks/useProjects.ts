import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectRow {
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

/** @deprecated Use ProjectRow */
export type BatchRow = ProjectRow;

export function useProjects() {
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
      return data as ProjectRow[];
    },
  });
}

/** @deprecated Use useProjects */
export const useBatches = useProjects;

export function useProjectDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["batch", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ProjectRow;
    },
    enabled: !!id,
  });
}

/** @deprecated Use useProjectDetail */
export const useBatchDetail = useProjectDetail;

export function useProjectParticipations(batchId: string | undefined) {
  return useQuery({
    queryKey: ["batch-participations", batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const { data: participations, error } = await supabase
        .from("batch_participations")
        .select("*")
        .eq("batch_id", batchId)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      if (!participations || participations.length === 0) return [];

      const userIds = [...new Set(participations.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles_public")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.full_name])
      );

      return participations.map((p) => ({
        ...p,
        profiles: { full_name: profileMap.get(p.user_id) || "Partner" },
      }));
    },
    enabled: !!batchId,
  });
}

/** @deprecated Use useProjectParticipations */
export const useBatchParticipations = useProjectParticipations;

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
