import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { MagicLinkEmail } from './_templates/magic-link.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    if (!hookSecret) {
      throw new Error('Missing SEND_EMAIL_HOOK_SECRET')
    }
    if (!resend) {
      throw new Error('Resend client not initialized. Missing RESEND_API_KEY?')
    }

    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)

    // Verify webhook signature from Supabase Auth Email Hooks
    const cleanedSecret = hookSecret.replace(/^v1,whsec_/, '');
    const wh = new Webhook(cleanedSecret)
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: { email: string }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url?: string
        token_new?: string
        token_hash_new?: string
      }
    }

    const subjectMap: Record<string, string> = {
      magiclink: 'Log in to Kindred Cards',
      signup: 'Confirm your Kindred Cards account',
      recovery: 'Reset your Kindred Cards password',
      email_change: 'Confirm your email change',
      invite: 'You have been invited to Kindred Cards',
    }

    const subject = subjectMap[email_action_type] || 'Your Kindred Cards link'

    const html = await renderAsync(
      React.createElement(MagicLinkEmail, {
        supabase_url: supabaseUrl,
        token,
        token_hash,
        redirect_to,
        email_action_type,
      })
    )

    const fromAddress = 'Kindred Cards <onboarding@resend.dev>'

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    console.error('send-email error:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
