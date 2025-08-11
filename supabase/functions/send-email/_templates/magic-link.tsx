import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  brand_logo_url?: string
}

const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  } as React.CSSProperties,
  container: {
    padding: '24px',
    margin: '0 auto',
    maxWidth: '560px',
    borderRadius: '14px',
    border: '1px solid #eee',
  } as React.CSSProperties,
  h1: {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  } as React.CSSProperties,
  sub: {
    color: '#475569',
    fontSize: '14px',
    margin: '0 0 24px 0',
    textAlign: 'center',
  } as React.CSSProperties,
  button: {
    display: 'inline-block',
    padding: '12px 18px',
    background: '#4f46e5',
    color: '#fff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
  } as React.CSSProperties,
  code: {
    display: 'inline-block',
    padding: '12px 4.5%',
    width: '90.5%',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    fontFamily: 'monospace',
  } as React.CSSProperties,
footer: {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '16px',
} as React.CSSProperties,
logoSection: {
  textAlign: 'center',
  marginBottom: '12px',
} as React.CSSProperties,
  logo: {
  display: 'block',
  margin: '0 auto 8px',
  width: '100%',
  maxWidth: '160px',
  height: 'auto',
} as React.CSSProperties,
ctaSection: {
  textAlign: 'center',
  margin: '16px 0',
} as React.CSSProperties,
}

export const MagicLinkEmail = ({
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  brand_logo_url,
}: MagicLinkEmailProps) => {
  const actionTextMap: Record<string, string> = {
    magiclink: 'Log in to Kindred Cards',
    signup: 'Confirm your Kindred Cards account',
    recovery: 'Reset your Kindred Cards password',
    email_change: 'Confirm your email change',
    invite: 'Join Kindred Cards',
  }

  const actionText = actionTextMap[email_action_type] || 'Continue to Kindred Cards'

  const linkHref = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(
    redirect_to
  )}`

  return (
    <Html>
      <Head />
      <Preview>{actionText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
<Section style={styles.logoSection}>
  {brand_logo_url ? (
    <img src={brand_logo_url} alt="Kindred Cards logo" width="160" style={styles.logo} />
  ) : null}
  <Heading style={styles.h1}>Kindred Cards</Heading>
</Section>
          <Text style={styles.sub}>{actionText}</Text>

          <Section style={styles.ctaSection}>
            <Link href={linkHref} target="_blank" style={styles.button}>
              {actionText}
            </Link>
          </Section>

          <Hr />


          <Text style={styles.footer}>
            If you didn’t request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail
