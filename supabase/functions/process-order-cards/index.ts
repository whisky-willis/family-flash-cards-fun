import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Card {
  id: string;
  name: string;
  relationship: string;
  user_session_id: string;
  front_image_url?: string;
  back_image_url?: string;
  print_ready: boolean;
  date_of_birth?: string;
  favorite_color?: string;
  hobbies?: string;
  fun_fact?: string;
  photo_url?: string;
  image_position?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log(`Processing cards for order session: ${sessionId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update order status to processing
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ processing_status: 'processing' })
      .eq('stripe_session_id', sessionId);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
    }

    // Get order data
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (orderError || !orderData) {
      throw new Error(`Order not found for session ${sessionId}: ${orderError?.message || 'No data'}`);
    }

    console.log(`Found order ${orderData.id} for session ${sessionId}`);

    // Get cards from the cards table that belong to this order
    const cardsData = orderData.cards_data as Card[];
    const sessionIds = [...new Set(cardsData.map((card: Card) => card.user_session_id))];
    
    console.log(`Found ${sessionIds.length} unique session IDs in order: ${sessionIds.join(', ')}`);

    // Get actual card records from database
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('user_session_id', sessionIds);

    if (cardsError) {
      throw new Error(`Error fetching cards: ${cardsError.message}`);
    }

    if (!cards || cards.length === 0) {
      throw new Error("No cards found for this order");
    }

    console.log(`Found ${cards.length} cards to process`);

    // Here we would normally process each card to generate images
    // For now, we'll simulate this by calling the image generation API
    // In a real implementation, you would use the canvas rendering logic
    
    const processedCards = [];
    
    for (const card of cards) {
      try {
        console.log(`Processing card: ${card.name} (${card.id})`);
        
        // Simulate image generation (in real implementation, use CanvasCardRenderer)
        // For now, we'll create placeholder URLs or use existing photo_url
        const frontImageUrl = card.front_image_url || `https://placeholder-image-url/front-${card.id}.png`;
        const backImageUrl = card.back_image_url || `https://placeholder-image-url/back-${card.id}.png`;
        
        // Update card with generated image URLs
        const { error: updateError } = await supabase
          .from('cards')
          .update({
            front_image_url: frontImageUrl,
            back_image_url: backImageUrl,
            print_ready: true
          })
          .eq('id', card.id);

        if (updateError) {
          console.error(`Error updating card ${card.id}:`, updateError);
          continue;
        }

        processedCards.push({
          ...card,
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl,
          print_ready: true
        });

        console.log(`✅ Card processed: ${card.name}`);
      } catch (error) {
        console.error(`Error processing card ${card.id}:`, error);
      }
    }

    // Update order with processed cards data
    const { error: orderCardsUpdateError } = await supabase
      .from('orders')
      .update({ 
        cards_data: processedCards,
        processing_status: 'completed'
      })
      .eq('stripe_session_id', sessionId);

    if (orderCardsUpdateError) {
      console.error('Error updating order cards data:', orderCardsUpdateError);
    }

    console.log(`✅ All cards processed. Sending email for session: ${sessionId}`);

    // Now send the email with the processed cards
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-order-email', {
      body: { sessionId }
    });

    if (emailError) {
      console.error('Error sending order email:', emailError);
      // Mark order as failed if email sending fails
      await supabase
        .from('orders')
        .update({ processing_status: 'failed' })
        .eq('stripe_session_id', sessionId);
      
      throw new Error(`Email sending failed: ${emailError.message}`);
    }

    console.log('✅ Order email sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      processedCards: processedCards.length,
      emailSent: true,
      emailData
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in process-order-cards function:", error);
    
    // Try to mark order as failed if we have a sessionId
    try {
      const { sessionId } = await req.json();
      if (sessionId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        
        await supabase
          .from('orders')
          .update({ processing_status: 'failed' })
          .eq('stripe_session_id', sessionId);
      }
    } catch (updateError) {
      console.error("Error updating order status to failed:", updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);