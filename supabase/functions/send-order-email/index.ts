
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

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
  created_at: string;
  print_ready: boolean;
  date_of_birth?: string;
  favorite_color?: string;
  hobbies?: string;
  fun_fact?: string;
  photo_url?: string;
}

interface OrderData {
  customer_email: string;
  customer_name: string;
  stripe_session_id: string;
  total_amount: number;
  card_count: number;
  special_instructions?: string;
  cards_data: Card[];
}

// Function to fetch and process card image
async function fetchCardImage(imageUrl: string, cardName: string, side: 'front' | 'back'): Promise<{ buffer: Uint8Array; filename: string } | null> {
  try {
    console.log(`Fetching ${side} image for ${cardName}: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch ${side} image: ${response.statusText}`);
      return null;
    }
    
    const imageBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    
    const filename = `${cardName.replace(/[^a-zA-Z0-9]/g, '_')}_${side}.jpg`;
    
    return {
      buffer: uint8Array,
      filename: filename
    };
  } catch (error) {
    console.error(`Error fetching ${side} image for ${cardName}:`, error);
    return null;
  }
}

// Function to group cards by session
function groupCardsBySession(cards: Card[]): Record<string, Card[]> {
  return cards.reduce((groups, card) => {
    const sessionId = card.user_session_id;
    if (!groups[sessionId]) {
      groups[sessionId] = [];
    }
    groups[sessionId].push(card);
    return groups;
  }, {} as Record<string, Card[]>);
}

// Function to generate email HTML with session grouping
function generateEmailHTML(cardGroups: Record<string, Card[]>, orderData: OrderData): string {
  const sessionCount = Object.keys(cardGroups).length;
  const totalCards = Object.values(cardGroups).flat().length;
  
  const sessionHTML = Object.entries(cardGroups).map(([sessionId, cards]) => {
    const cardList = cards.map(card => `
      <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 5px 0; color: #333;">${card.name}</h4>
        <p style="margin: 5px 0; color: #666;">
          <strong>Images:</strong><br>
          Front: ${card.front_image_url ? `✓ <a href="${card.front_image_url}" style="color: #2754C5;">View Image</a>` : '✗ Not available'}<br>
          Back: ${card.back_image_url ? `✓ <a href="${card.back_image_url}" style="color: #2754C5;">View Image</a>` : '✗ Not available'}
        </p>
        ${card.front_image_url || card.back_image_url ? `
        <div style="margin: 10px 0; padding: 10px; background-color: #f0f8ff; border-left: 3px solid #2754C5;">
          <p style="margin: 0; font-size: 12px; color: #555;"><strong>Image URLs:</strong></p>
          ${card.front_image_url ? `<p style="margin: 2px 0; font-size: 11px; word-break: break-all;"><strong>Front:</strong> ${card.front_image_url}</p>` : ''}
          ${card.back_image_url ? `<p style="margin: 2px 0; font-size: 11px; word-break: break-all;"><strong>Back:</strong> ${card.back_image_url}</p>` : ''}
        </div>` : ''}
      </div>
    `).join('');
    
    return `
      <div style="margin-bottom: 30px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; background-color: #f5f5f5;">
        <h3 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
          Session: ${sessionId.slice(-8)} (${cards.length} cards)
        </h3>
        ${cardList}
      </div>
    `;
  }).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">New Kindred Cards Order</h1>
      
      <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #34495e; margin-top: 0;">Order Summary</h2>
        <p><strong>Customer:</strong> ${orderData.customer_name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${orderData.customer_email || 'Not provided'}</p>
        <p><strong>Total Cards:</strong> ${totalCards}</p>
        <p><strong>Sessions:</strong> ${sessionCount}</p>
        <p><strong>Order Total:</strong> $${(orderData.total_amount / 100).toFixed(2)}</p>
        <p><strong>Stripe Session ID:</strong> ${orderData.stripe_session_id}</p>
        ${orderData.special_instructions ? `<p><strong>Special Instructions:</strong> ${orderData.special_instructions}</p>` : ''}
      </div>
      
      <h2 style="color: #34495e;">Cards by Session</h2>
      ${sessionHTML}
      
      <div style="margin-top: 30px; padding: 15px; background-color: #d5f4e6; border-radius: 8px;">
        <p style="margin: 0; color: #27ae60;"><strong>✓ High-resolution images for printing are attached to this email</strong></p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 2px solid #bdc3c7;">
      <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
        This email was automatically generated when a customer completed their order.
      </p>
    </div>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if Resend API key is configured
  if (!resendApiKey) {
    console.error("RESEND_API_KEY environment variable is not configured");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log(`Processing order email for session: ${sessionId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    // Parse cards from orders.cards_data
    const cards: Card[] = Array.isArray(orderData.cards_data) ? orderData.cards_data : [];

    if (!cards || cards.length === 0) {
      throw new Error("No cards found in order data");
    }

    console.log(`Found ${cards.length} cards in order data`);

    // Group cards by session
    const cardGroups = groupCardsBySession(cards);
    const sessionCount = Object.keys(cardGroups).length;
    
    console.log(`Cards grouped into ${sessionCount} sessions`);

    // Process all card images for attachments
    const attachments = [];
    
    for (const card of cards) {
      try {
        // Process front image
        if (card.front_image_url) {
          const frontImage = await fetchCardImage(card.front_image_url, card.name, 'front');
          if (frontImage) {
            attachments.push({
              filename: frontImage.filename,
              content: frontImage.buffer,
            });
          }
        }

        // Process back image
        if (card.back_image_url) {
          const backImage = await fetchCardImage(card.back_image_url, card.name, 'back');
          if (backImage) {
            attachments.push({
              filename: backImage.filename,
              content: backImage.buffer,
            });
          }
        }

        // Log if images are missing
        if (!card.front_image_url && !card.back_image_url) {
          console.warn(`Card ${card.name} has no images available`);
        }
      } catch (error) {
        console.error(`Error processing images for card ${card.name}:`, error);
        // Continue with other cards even if one fails
      }
    }

    console.log(`Processed ${attachments.length} image attachments`);

    // Generate email HTML
    const emailHtml = generateEmailHTML(cardGroups, {
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      stripe_session_id: orderData.stripe_session_id,
      total_amount: orderData.total_amount || 0,
      card_count: cards.length,
      special_instructions: orderData.special_instructions,
      cards_data: cards
    });

    // Send email with attachments
    const emailResponse = await resend.emails.send({
      from: "Kindred Cards <orders@kindred-cards.com>",
      to: ["nick.g.willis@gmail.com"],
      subject: `New Kindred Cards Order - ${cards.length} cards from ${sessionCount} sessions`,
      html: emailHtml,
      attachments: attachments,
    });

    console.log("Order email sent successfully:", emailResponse);
    
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      cardCount: cards.length,
      sessionCount: sessionCount,
      attachmentCount: attachments.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
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
