import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SellingPreference = "platform" | "collect";

export function useJoinProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      batchId,
      units,
      totalInvested,
      sellingPreference = "platform",
    }: {
      batchId: string;
      units: number;
      totalInvested: number;
      sellingPreference?: SellingPreference;
    }) => {
      const { data, error } = await supabase.rpc("join_batch" as any, {
        p_batch_id: batchId,
        p_units: units,
        p_total_invested: totalInvested,
        p_selling_preference: sellingPreference,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch"] });
      queryClient.invalidateQueries({ queryKey: ["batch-participations"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["my-participations"] });
    },
  });
}

/** @deprecated Use useJoinProject */
export const useJoinBatch = useJoinProject;
