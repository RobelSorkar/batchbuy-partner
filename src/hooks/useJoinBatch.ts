import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useJoinBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, units, totalInvested }: { batchId: string; units: number; totalInvested: number }) => {
      const { data, error } = await supabase.rpc("join_batch", {
        p_batch_id: batchId,
        p_units: units,
        p_total_invested: totalInvested,
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
