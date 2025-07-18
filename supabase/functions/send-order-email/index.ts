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
  image: string;
  backImage?: string;
  relationship: string;
  story: string;
  memories: string[];
  favoriteThings: string[];
}

// Function to convert image to high-res square format
async function processCardImage(imageUrl: string, cardName: string, side: 'front' | 'back'): Promise<{ buffer: Uint8Array; filename: string }> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    
    // For now, return the image as-is. In a production environment,
    // you might want to use a service like Sharp or similar for image processing
    const filename = `${cardName.replace(/[^a-zA-Z0-9]/g, '_')}_${side}.jpg`;
    
    return {
      buffer: uint8Array,
      filename: filename
    };
  } catch (error) {
    console.error(`Error processing image for ${cardName} ${side}:`, error);
    throw error;
  }
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

    // Retrieve order data from database
    const { data: orderData, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (dbError || !orderData) {
      throw new Error(`Order not found for session ${sessionId}: ${dbError?.message || 'No data'}`);
    }

    const cards = orderData.cards_data;
    const orderDetails = orderData.order_details;

    if (!cards || cards.length === 0) {
      throw new Error("No cards found in order");
    }

    console.log(`Processing order for ${cards.length} cards`);

    // Process all card images
    const attachments = [];
    
    for (const card of cards) {
      try {
        // Process front image
        if (card.image) {
          const frontImage = await processCardImage(card.image, card.name, 'front');
          attachments.push({
            filename: frontImage.filename,
            content: frontImage.buffer,
          });
        }

        // Process back image if available
        if (card.backImage) {
          const backImage = await processCardImage(card.backImage, card.name, 'back');
          attachments.push({
            filename: backImage.filename,
            content: backImage.buffer,
          });
        } else {
          // Create a simple back design with card details
          const backContent = `
Card: ${card.name}
Relationship: ${card.relationship}
Story: ${card.story}
Memories: ${card.memories?.join(', ') || 'None'}
Favorite Things: ${card.favoriteThings?.join(', ') || 'None'}
          `.trim();
          
          const backFilename = `${card.name.replace(/[^a-zA-Z0-9]/g, '_')}_back_details.txt`;
          attachments.push({
            filename: backFilename,
            content: new TextEncoder().encode(backContent),
          });
        }
      } catch (error) {
        console.error(`Error processing card ${card.name}:`, error);
        // Continue with other cards even if one fails
      }
    }

    // Create card list for email
    const cardList = cards.map((card: Card) => `
      <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        <h3 style="margin: 0 0 5px 0; color: #333;">${card.name}</h3>
        <p style="margin: 0; color: #666;"><strong>Relationship:</strong> ${card.relationship}</p>
        ${card.story ? `<p style="margin: 5px 0; color: #666;"><strong>Story:</strong> ${card.story}</p>` : ''}
        ${card.memories?.length ? `<p style="margin: 5px 0; color: #666;"><strong>Memories:</strong> ${card.memories.join(', ')}</p>` : ''}
        ${card.favoriteThings?.length ? `<p style="margin: 5px 0; color: #666;"><strong>Favorite Things:</strong> ${card.favoriteThings.join(', ')}</p>` : ''}
      </div>
    `).join('');

    const emailHtml = `
      <h1>New Kindred Cards Order</h1>
      <h2>Order Details</h2>
      <p><strong>Customer Email:</strong> ${orderDetails?.email || 'Not provided'}</p>
      <p><strong>Customer Name:</strong> ${orderDetails?.name || 'Not provided'}</p>
      <p><strong>Number of Cards:</strong> ${cards.length}</p>
      <p><strong>Stripe Session ID:</strong> ${sessionId || 'Not provided'}</p>
      ${orderDetails?.specialInstructions ? `<p><strong>Special Instructions:</strong> ${orderDetails.specialInstructions}</p>` : ''}
      
      <h2>Cards Ordered</h2>
      ${cardList}
      
      <p>High-resolution images for printing are attached to this email.</p>
      
      <hr style="margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">This email was automatically generated when a customer completed their order.</p>
    `;

    // Send email with attachments
    const emailResponse = await resend.emails.send({
      from: "Kindred Cards <delivered@resend.dev>",
      to: ["nick.g.williss@gmail.com"],
      subject: `New Kindred Cards Order - ${cards.length} cards`,
      html: emailHtml,
      attachments: attachments,
    });

    console.log("Order email sent successfully:", emailResponse);
    
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
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