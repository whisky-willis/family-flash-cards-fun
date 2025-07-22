
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cards, orderDetails } = await req.json();
    
    if (!cards || cards.length === 0) {
      throw new Error("No cards provided");
    }

    if (!orderDetails?.email) {
      throw new Error("Email is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const pricePerCard = 3.99;
    const shippingCost = 5.99;

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Kindred Cards (${cards.length} cards)`,
            description: `Custom family cards featuring: ${cards.map((card: any) => card.name).join(", ")}`,
          },
          unit_amount: Math.round(pricePerCard * 100), // Convert to cents
        },
        quantity: cards.length,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping for your card order",
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: orderDetails.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancel`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add countries as needed
      },
      metadata: {
        card_count: cards.length.toString(),
        customer_email: orderDetails.email,
        special_instructions: orderDetails.specialInstructions || "",
        recipient_name: orderDetails.deckDesign?.recipientName || "",
      },
    });

    // Store comprehensive order data in database
    const totalAmount = Math.round((cards.length * pricePerCard + shippingCost) * 100); // in cents
    
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        cards_data: cards,
        order_details: orderDetails, // This now includes the deckDesign data
        customer_name: orderDetails.name,
        customer_email: orderDetails.email,
        total_amount: totalAmount,
        card_count: cards.length,
        special_instructions: orderDetails.specialInstructions || null,
        payment_status: 'pending',
        fulfillment_status: 'pending',
        status: 'payment_pending'
      });

    if (dbError) {
      console.error('Error storing order data:', dbError);
      // Don't fail the payment creation, just log the error
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
