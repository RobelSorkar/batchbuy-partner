import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find batches past deadline that are still in "funding" status
    const { data: expiredBatches, error: fetchError } = await supabase
      .from("batches")
      .select("id, batch_name, deadline, funded_units, total_quantity")
      .eq("status", "funding")
      .not("deadline", "is", null)
      .lt("deadline", new Date().toISOString());

    if (fetchError) throw fetchError;

    const results = [];

    for (const batch of expiredBatches || []) {
      // If fully funded, move to production; otherwise mark as cancelled
      const newStatus =
        batch.funded_units >= batch.total_quantity ? "production" : "cancelled";

      const { error: updateError } = await supabase
        .from("batches")
        .update({ status: newStatus })
        .eq("id", batch.id);

      if (updateError) {
        results.push({ id: batch.id, name: batch.batch_name, error: updateError.message });
      } else {
        results.push({ id: batch.id, name: batch.batch_name, newStatus });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
