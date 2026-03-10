import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      batchId,
      quantity,
      referrerId, // dropshipper user ID
    } = body;

    // Validate inputs
    if (!customerName || customerName.trim().length < 2) {
      return new Response(JSON.stringify({ error: "নাম কমপক্ষে ২ অক্ষর হতে হবে" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!customerPhone || !phoneRegex.test(customerPhone.trim())) {
      return new Response(JSON.stringify({ error: "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!customerAddress || customerAddress.trim().length < 5) {
      return new Response(JSON.stringify({ error: "ঠিকানা কমপক্ষে ৫ অক্ষর হতে হবে" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!batchId) {
      return new Response(JSON.stringify({ error: "Batch ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 100) {
      return new Response(JSON.stringify({ error: "পরিমাণ ১-১০০ এর মধ্যে হতে হবে" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch batch
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .in("status", ["production", "completed"])
      .single();

    if (batchError || !batch) {
      return new Response(JSON.stringify({ error: "প্রোডাক্ট পাওয়া যায়নি বা বিক্রির জন্য উপলব্ধ নয়" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check inventory stock
    const { data: inventory } = await supabase
      .from("inventory")
      .select("*")
      .eq("batch_id", batchId)
      .single();

    if (inventory) {
      const available = inventory.total_stock - inventory.sold_units - inventory.allocated_stock;
      if (qty > available) {
        return new Response(JSON.stringify({ error: `স্টকে মাত্র ${available}টি আছে` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const retailPrice = Number(batch.retail_price);
    const wholesalePrice = Number(batch.wholesale_price);
    const totalAmount = retailPrice * qty;
    const commission = (retailPrice - wholesalePrice) * qty;

    // Generate order number
    const { data: orderNumber } = await supabase.rpc("generate_order_number", {
      p_channel: "dropshipper",
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        channel: "dropshipper",
        total_amount: totalAmount,
        commission: commission,
        seller_id: referrerId || null,
        batch_id: batchId,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "অর্ডার তৈরি করতে সমস্যা হয়েছে" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create order items
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_name: batch.product_name,
      quantity: qty,
      unit_price: retailPrice,
      total_price: totalAmount,
    });

    // Notify dropshipper if referrer exists
    if (referrerId) {
      await supabase.from("notifications").insert({
        user_id: referrerId,
        title: "নতুন অর্ডার পেয়েছেন!",
        message: `${customerName} আপনার রেফারাল লিংক থেকে ${batch.product_name} অর্ডার করেছেন। কমিশন: ৳${commission.toLocaleString()}`,
        type: "order",
        reference_id: order.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderNumber: order.order_number,
        totalAmount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "সার্ভারে সমস্যা হয়েছে" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
