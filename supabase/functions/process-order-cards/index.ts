
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

    // Extract card IDs from the cards_data in the order
    const cardsData = orderData.cards_data as Card[];
    const cardIds = cardsData.map((card: Card) => card.id);
    
    console.log(`Found ${cardIds.length} card IDs in order: ${cardIds.join(', ')}`);

    // Get actual card records from database using the card IDs
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('id', cardIds);

    if (cardsError) {
      throw new Error(`Error fetching cards: ${cardsError.message}`);
    }

    if (!cards || cards.length === 0) {
      throw new Error(`No cards found with IDs: ${cardIds.join(', ')}`);
    }

    console.log(`Found ${cards.length} cards in database`);

    // Check if cards are already processed
    const alreadyProcessedCards = cards.filter(card => 
      card.front_image_url && card.back_image_url && card.print_ready
    );

    const cardsToProcess = cards.filter(card => 
      !card.front_image_url || !card.back_image_url || !card.print_ready
    );

    console.log(`${alreadyProcessedCards.length} cards already processed, ${cardsToProcess.length} cards need processing`);

    // Process cards that need processing
    const processedCards = [...alreadyProcessedCards];
    
    for (const card of cardsToProcess) {
      try {
        console.log(`Processing card: ${card.name} (${card.id})`);
        
        // Simulate image generation (in real implementation, use CanvasCardRenderer)
        // For now, we'll use existing photo_url or create placeholder URLs
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

    // If no cards needed processing, we already have all processed cards
    if (cardsToProcess.length === 0) {
      console.log('✅ All cards already processed, using existing data');
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
      alreadyProcessed: alreadyProcessedCards.length,
      newlyProcessed: cardsToProcess.length,
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
      const body = await req.text();
      const parsedBody = JSON.parse(body);
      const sessionId = parsedBody.sessionId;
      
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
