/**
 * Subscription Expiring Email Template
 *
 * Sent as a reminder when a subscription is about to expire.
 */

import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'
import { SubscriptionExpiringData } from '../types'
import { EMAIL_BRAND, getUnsubscribeUrl } from '../config'

interface SubscriptionExpiringEmailProps extends SubscriptionExpiringData {
  userId?: string
}

export function SubscriptionExpiringEmail({
  name,
  plan,
  daysLeft,
  expirationDate,
  renewUrl,
  userId,
}: SubscriptionExpiringEmailProps): React.ReactElement {
  const urgencyText =
    daysLeft <= 1
      ? 'expires tomorrow'
      : daysLeft <= 3
        ? `expires in ${daysLeft} days`
        : `expires in ${daysLeft} days`

  return (
    <BaseLayout
      preview={`Your ${EMAIL_BRAND.name} subscription ${urgencyText}`}
      unsubscribeUrl={
        userId ? getUnsubscribeUrl(userId, 'subscription_expiring') : undefined
      }
    >
      <Section style={styles.urgencyBanner}>
        <Text style={styles.urgencyText}>
          {daysLeft <= 1 ? 'EXPIRES TOMORROW' : `${daysLeft} DAYS LEFT`}
        </Text>
      </Section>

      <Heading style={styles.heading}>Your Subscription is Expiring</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        This is a friendly reminder that your <strong>{plan}</strong>{' '}
        subscription will expire on <strong>{expirationDate}</strong>.
      </Text>

      <Text style={styles.paragraph}>
        To continue enjoying all the premium features without interruption,
        please renew your subscription before it expires.
      </Text>

      <Section style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>
          Keep access to these features:
        </Text>
        <ul style={styles.featuresList}>
          <li style={styles.featureItem}>
            Unlimited searches and remedy lookups
          </li>
          <li style={styles.featureItem}>
            Save unlimited favorites and collections
          </li>
          <li style={styles.featureItem}>
            AI-powered remedy recommendations
          </li>
          <li style={styles.featureItem}>Drug interaction checking</li>
          <li style={styles.featureItem}>Priority customer support</li>
        </ul>
      </Section>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={renewUrl}>
          Renew Subscription
        </Button>
      </Section>

      <Section style={styles.noteSection}>
        <Text style={styles.noteText}>
          <strong>Note:</strong> If you do not renew, your account will
          automatically switch to the free plan on {expirationDate}. Your saved
          data will be preserved, but some features will be limited.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Questions about your subscription? Reply to this email and our support
        team will be happy to help.
      </Text>

      <Text style={styles.signature}>
        Thank you for being a {EMAIL_BRAND.name} subscriber!
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>
    </BaseLayout>
  )
}

const styles = {
  urgencyBanner: {
    backgroundColor: daysLeftColor(7),
    borderRadius: '8px',
    marginBottom: '24px',
    padding: '12px',
    textAlign: 'center' as const,
  },
  urgencyText: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    letterSpacing: '1px',
    margin: '0',
  },
  heading: {
    color: EMAIL_BRAND.textColor,
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  },
  greeting: {
    color: EMAIL_BRAND.textColor,
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  paragraph: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  featuresSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '20px',
  },
  featuresTitle: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    fontWeight: 'bold' as const,
    margin: '0 0 12px 0',
  },
  featuresList: {
    margin: '0',
    paddingLeft: '20px',
  },
  featureItem: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    lineHeight: '28px',
  },
  ctaSection: {
    margin: '32px 0',
    textAlign: 'center' as const,
  },
  ctaButton: {
    backgroundColor: EMAIL_BRAND.primaryColor,
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    padding: '12px 32px',
    textDecoration: 'none',
  },
  noteSection: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '16px',
  },
  noteText: {
    color: '#92400e',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0',
  },
  signature: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '24px 0 0 0',
  },
}

/**
 * Get urgency color based on days left
 */
function daysLeftColor(daysLeft: number): string {
  if (daysLeft <= 1) return '#dc2626' // Red
  if (daysLeft <= 3) return '#f59e0b' // Amber
  return '#3b82f6' // Blue
}

export default SubscriptionExpiringEmail
