import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log("Sending test email...");
    
    const emailHtml = `
      <h1>Test Email from Kindred Cards</h1>
      <p>This is a test email to verify the email service is working correctly.</p>
      <p>If you received this email, the Resend integration is working!</p>
      <p>Sent at: ${new Date().toISOString()}</p>
    `;

    // Send test email
    const emailResponse = await resend.emails.send({
      from: "Kindred Cards <delivered@resend.dev>",
      to: ["nick.g.williss@gmail.com"],
      subject: "Test Email - Kindred Cards",
      html: emailHtml,
    });

    console.log("Test email sent successfully:", emailResponse);
    
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Test email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in test-email function:", error);
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