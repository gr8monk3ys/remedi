/**
 * Base Email Layout
 *
 * Shared layout component for all email templates.
 * Provides consistent branding and styling.
 */

import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EMAIL_BRAND, getEmailUrl, EMAIL_URLS } from '../config'

interface BaseLayoutProps {
  preview: string
  children: React.ReactNode
  unsubscribeUrl?: string
}

export function BaseLayout({
  preview,
  children,
  unsubscribeUrl,
}: BaseLayoutProps): React.ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Link href={getEmailUrl(EMAIL_URLS.home)} style={styles.logoLink}>
              <Text style={styles.logoText}>{EMAIL_BRAND.name}</Text>
            </Link>
            <Text style={styles.tagline}>{EMAIL_BRAND.tagline}</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This email was sent by {EMAIL_BRAND.name}. If you have any
              questions, please contact us at{' '}
              <Link
                href={getEmailUrl(EMAIL_URLS.support)}
                style={styles.footerLink}
              >
                support@remedi.com
              </Link>
            </Text>

            <Text style={styles.footerLinks}>
              <Link
                href={getEmailUrl(EMAIL_URLS.privacyPolicy)}
                style={styles.footerLink}
              >
                Privacy Policy
              </Link>
              {' | '}
              <Link
                href={getEmailUrl(EMAIL_URLS.termsOfService)}
                style={styles.footerLink}
              >
                Terms of Service
              </Link>
              {unsubscribeUrl && (
                <>
                  {' | '}
                  <Link href={unsubscribeUrl} style={styles.footerLink}>
                    Unsubscribe
                  </Link>
                </>
              )}
            </Text>

            <Text style={styles.copyright}>
              &copy; {currentYear} {EMAIL_BRAND.name}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: EMAIL_BRAND.backgroundColor,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    maxWidth: '600px',
    padding: '0',
  },
  header: {
    backgroundColor: EMAIL_BRAND.primaryColor,
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  logoLink: {
    textDecoration: 'none',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold' as const,
    margin: '0',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  content: {
    padding: '32px 24px',
  },
  footer: {
    backgroundColor: '#f3f4f6',
    borderTop: '1px solid #e5e7eb',
    padding: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: EMAIL_BRAND.footerColor,
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0 0 16px 0',
  },
  footerLinks: {
    color: EMAIL_BRAND.footerColor,
    fontSize: '12px',
    margin: '0 0 16px 0',
  },
  footerLink: {
    color: EMAIL_BRAND.primaryColor,
    textDecoration: 'none',
  },
  copyright: {
    color: '#9ca3af',
    fontSize: '11px',
    margin: '0',
  },
}

export default BaseLayout
