/**
 * Password Reset Email Template
 *
 * Sent when a user requests a password reset (for future email auth).
 */

import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'
import { PasswordResetData } from '../types'
import { EMAIL_BRAND } from '../config'

interface PasswordResetEmailProps extends PasswordResetData {
  userId?: string
}

export function PasswordResetEmail({
  name,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps): React.ReactElement {
  return (
    <BaseLayout preview={`Reset your ${EMAIL_BRAND.name} password`}>
      <Heading style={styles.heading}>Reset Your Password</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        We received a request to reset the password for your {EMAIL_BRAND.name}{' '}
        account. Click the button below to create a new password.
      </Text>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Section style={styles.expirySection}>
        <Text style={styles.expiryText}>
          This link will expire in <strong>{expiresIn}</strong>. After that, you
          will need to request a new password reset.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        If the button does not work, copy and paste this URL into your browser:
      </Text>

      <Section style={styles.urlSection}>
        <Text style={styles.urlText}>{resetUrl}</Text>
      </Section>

      <Section style={styles.securitySection}>
        <Text style={styles.securityTitle}>Did not request this?</Text>
        <Text style={styles.securityText}>
          If you did not request a password reset, you can safely ignore this
          email. Your password will remain unchanged.
        </Text>
        <Text style={styles.securityText}>
          For your security, if you suspect unauthorized access to your account,
          please contact our support team immediately.
        </Text>
      </Section>

      <Text style={styles.signature}>
        Stay secure,
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>
    </BaseLayout>
  )
}

const styles = {
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
    padding: '14px 40px',
    textDecoration: 'none',
  },
  expirySection: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '12px 16px',
    textAlign: 'center' as const,
  },
  expiryText: {
    color: '#92400e',
    fontSize: '13px',
    margin: '0',
  },
  urlSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    margin: '16px 0',
    padding: '12px',
    wordBreak: 'break-all' as const,
  },
  urlText: {
    color: EMAIL_BRAND.primaryColor,
    fontSize: '12px',
    margin: '0',
  },
  securitySection: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '16px',
  },
  securityTitle: {
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    margin: '0 0 8px 0',
  },
  securityText: {
    color: '#991b1b',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 8px 0',
  },
  signature: {
    color: EMAIL_BRAND.textColor,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '24px 0 0 0',
  },
}

export default PasswordResetEmail
