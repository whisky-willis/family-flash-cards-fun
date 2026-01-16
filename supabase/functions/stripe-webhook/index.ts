import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
      },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(`Processing completed checkout session: ${session.id}`);

      // Initialize Supabase client
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Check if order has already been processed
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("processing_status")
        .eq("stripe_session_id", session.id)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        // Order might not exist yet, continue anyway
      }

      // Skip if already completed
      if (order?.processing_status === "completed") {
        console.log(`Order ${session.id} already processed, skipping`);
        return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "payment_received"
        })
        .eq("stripe_session_id", session.id);

      if (updateError) {
        console.error("Error updating order payment status:", updateError);
      }

      // Call process-order-cards function
      // This is idempotent - if already called via redirect, it will skip
      try {
        const { data, error } = await supabase.functions.invoke("process-order-cards", {
          body: { sessionId: session.id },
        });

        if (error) {
          console.error("Error calling process-order-cards:", error);
          // Don't fail the webhook - order can be processed manually
        } else {
          console.log("process-order-cards completed:", data);
        }
      } catch (invokeError) {
        console.error("Failed to invoke process-order-cards:", invokeError);
        // Don't fail the webhook
      }
    }

    // Handle payment_intent.payment_failed for logging
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error(`Payment failed for intent: ${paymentIntent.id}`);

      // Could update order status here if needed
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
