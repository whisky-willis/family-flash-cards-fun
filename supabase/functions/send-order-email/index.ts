
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsBaseHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getCorsHeaders = (origin: string | null) => {
  let allowOrigin = "*";
  if (origin && allowedOrigins.length > 0) {
    allowOrigin = allowedOrigins.includes(origin) ? origin : "";
  } else if (origin) {
    allowOrigin = origin;
  }
  const headers: Record<string, string> = { ...corsBaseHeaders };
  if (allowOrigin) headers["Access-Control-Allow-Origin"] = allowOrigin;
  return headers;
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

// Note: Image fetching removed to prevent memory issues - images are now included as URLs in email body

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

// Basic HTML escape to prevent injection
function escapeHtml(input: any): string {
  const str = String(input ?? "");
  return str.replace(/[&<>"'`=\/]/g, (s) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  } as Record<string,string>)[s] || s);
}

function isSafeHttpUrl(u?: string): string {
  try {
    if (!u) return "";
    const url = new URL(u);
    return (url.protocol === 'https:' || url.protocol === 'http:') ? u : "";
  } catch {
    return "";
  }
}

// Function to generate email HTML with session grouping
function generateEmailHTML(cardGroups: Record<string, Card[]>, orderData: OrderData): string {
  const sessionCount = Object.keys(cardGroups).length;
  const totalCards = Object.values(cardGroups).flat().length;
  const cacheBuster = Date.now();
  
  const sessionHTML = Object.entries(cardGroups).map(([sessionId, cards]) => {
    const cardList = cards.map(card => {
      const front = isSafeHttpUrl(card.front_image_url || "");
      const back = isSafeHttpUrl(card.back_image_url || "");
      return `
      <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 5px 0; color: #333;">${escapeHtml(card.name)}</h4>
        <p style="margin: 5px 0; color: #666;">
          <strong>Images:</strong><br>
          Front: ✓ <a href="${front ? `${front}?v=${cacheBuster}` : '#'}" style="color: #2754C5;">View Image</a><br>
          Back: ✓ <a href="${back ? `${back}?v=${cacheBuster}` : '#'}" style="color: #2754C5;">View Image</a>
        </p>
        ${(front || back) ? `
        <div style="margin: 10px 0; padding: 10px; background-color: #f0f8ff; border-left: 3px solid #2754C5;">
          <p style="margin: 0; font-size: 12px; color: #555;"><strong>Image URLs:</strong></p>
          ${front ? `<p style="margin: 2px 0; font-size: 11px; word-break: break-all;"><strong>Front:</strong> ${escapeHtml(`${front}?v=${cacheBuster}`)}</p>` : ''}
          ${back ? `<p style="margin: 2px 0; font-size: 11px; word-break: break-all;"><strong>Back:</strong> ${escapeHtml(`${back}?v=${cacheBuster}`)}</p>` : ''}
        </div>` : ''}
      </div>
      `;
    }).join('');
    
    return `
      <div style="margin-bottom: 30px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; background-color: #f5f5f5;">
        <h3 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
          Session: ${escapeHtml(sessionId.slice(-8))} (${cards.length} cards)
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
        <p><strong>Customer:</strong> ${escapeHtml(orderData.customer_name || 'Not provided')}</p>
        <p><strong>Email:</strong> ${escapeHtml(orderData.customer_email || 'Not provided')}</p>
        <p><strong>Total Cards:</strong> ${totalCards}</p>
        <p><strong>Sessions:</strong> ${sessionCount}</p>
        <p><strong>Order Total:</strong> $${((orderData.total_amount || 0) / 100).toFixed(2)}</p>
        ${orderData.special_instructions ? `<p><strong>Special Instructions:</strong> ${escapeHtml(orderData.special_instructions)}</p>` : ''}
      </div>
      
      <h2 style="color: #34495e;">Cards by Session</h2>
      ${sessionHTML}
      
      <div style="margin-top: 30px; padding: 15px; background-color: #d5f4e6; border-radius: 8px;">
        <p style="margin: 0; color: #27ae60;"><strong>✓ High-resolution image URLs are included above for each card</strong></p>
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
    return new Response(null, { headers: getCorsHeaders(req.headers.get('origin')) });
  }

  // Check if Resend API key is configured
  if (!resendApiKey) {
    console.error("RESEND_API_KEY environment variable is not configured");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      headers: { ...getCorsHeaders(req.headers.get('origin')), "Content-Type": "application/json" },
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

    console.log(`Found ${cards.length} cards, image URLs will be included in email body`);

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

    const recipientName = orderData.order_details?.deckDesign?.recipientName;
    const sanitizeSubject = (s: string) => String(s || '').replace(/[\r\n]/g, '').slice(0, 200);
    const emailSubject = recipientName ? sanitizeSubject(`New Kindred Cards Order - for ${recipientName}`) : 'New Kindred Cards Order';

    // Send email to both customer and admin
    const recipients = [orderData.customer_email, "nick.g.willis@gmail.com"].filter(Boolean);

    const emailResponse = await resend.emails.send({
      from: "Kindred Cards <orders@kindred-cards.com>",
      to: recipients,
      subject: emailSubject,
      html: emailHtml,
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
      sessionCount: sessionCount
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(req.headers.get('origin')),
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(req.headers.get('origin')) },
      }
    );
  }
};

serve(handler);
