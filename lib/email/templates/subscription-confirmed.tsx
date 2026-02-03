/**
 * Subscription Confirmed Email Template
 *
 * Sent when a user successfully subscribes to a paid plan.
 */

import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'
import { SubscriptionConfirmedData } from '../types'
import { EMAIL_BRAND, getUnsubscribeUrl } from '../config'

interface SubscriptionConfirmedEmailProps extends SubscriptionConfirmedData {
  userId?: string
}

export function SubscriptionConfirmedEmail({
  name,
  plan,
  interval,
  price,
  nextBillingDate,
  manageUrl,
  userId,
}: SubscriptionConfirmedEmailProps): React.ReactElement {
  return (
    <BaseLayout
      preview={`Your ${EMAIL_BRAND.name} ${plan} subscription is now active!`}
      unsubscribeUrl={
        userId ? getUnsubscribeUrl(userId, 'subscription_confirmed') : undefined
      }
    >
      <Heading style={styles.heading}>Subscription Confirmed!</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        Thank you for subscribing to {EMAIL_BRAND.name}! Your{' '}
        <strong>{plan}</strong> plan is now active.
      </Text>

      <Section style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Subscription Details</Text>
        <table style={styles.detailsTable}>
          <tbody>
            <tr>
              <td style={styles.detailLabel}>Plan:</td>
              <td style={styles.detailValue}>{plan}</td>
            </tr>
            <tr>
              <td style={styles.detailLabel}>Billing Cycle:</td>
              <td style={styles.detailValue}>
                {interval === 'yearly' ? 'Annual' : 'Monthly'}
              </td>
            </tr>
            <tr>
              <td style={styles.detailLabel}>Price:</td>
              <td style={styles.detailValue}>
                {price}/{interval === 'yearly' ? 'year' : 'month'}
              </td>
            </tr>
            <tr>
              <td style={styles.detailLabel}>Next Billing Date:</td>
              <td style={styles.detailValue}>{nextBillingDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={styles.paragraph}>
        You now have access to all the premium features included in your plan.
        Start exploring the full power of {EMAIL_BRAND.name} today!
      </Text>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={manageUrl}>
          Manage Subscription
        </Button>
      </Section>

      <Section style={styles.helpSection}>
        <Text style={styles.helpText}>
          <strong>Need help?</strong> Our support team is here to assist you.
          Simply reply to this email or visit our help center.
        </Text>
      </Section>

      <Text style={styles.signature}>
        Thank you for your support!
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>
    </BaseLayout>
  )
}

const styles = {
  heading: {
    color: EMAIL_BRAND.primaryColor,
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
  detailsSection: {
    backgroundColor: '#f0fdf4',
    border: `1px solid ${EMAIL_BRAND.primaryColor}`,
    borderRadius: '8px',
    margin: '24px 0',
    padding: '20px',
  },
  detailsTitle: {
    color: EMAIL_BRAND.primaryColor,
    fontSize: '16px',
    fontWeight: 'bold' as const,
    margin: '0 0 16px 0',
  },
  detailsTable: {
    width: '100%',
  },
  detailLabel: {
    color: EMAIL_BRAND.footerColor,
    fontSize: '14px',
    padding: '8px 16px 8px 0',
    verticalAlign: 'top' as const,
    width: '40%',
  },
  detailValue: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    fontWeight: '500' as const,
    padding: '8px 0',
    verticalAlign: 'top' as const,
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
  helpSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '16px',
    textAlign: 'center' as const,
  },
  helpText: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    margin: '0',
  },
  signature: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '24px 0 0 0',
  },
}

export default SubscriptionConfirmedEmail
