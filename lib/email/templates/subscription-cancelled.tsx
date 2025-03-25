/**
 * Subscription Cancelled Email Template
 *
 * Sent when a user cancels their subscription.
 */

import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { SubscriptionCancelledData } from "../types";
import { EMAIL_BRAND, getUnsubscribeUrl } from "../config";

interface SubscriptionCancelledEmailProps extends SubscriptionCancelledData {
  userId?: string;
}

export function SubscriptionCancelledEmail({
  name,
  plan,
  accessUntil,
  resubscribeUrl,
  userId,
}: SubscriptionCancelledEmailProps): React.ReactElement {
  return (
    <BaseLayout
      preview={`Your ${EMAIL_BRAND.name} subscription has been cancelled`}
      unsubscribeUrl={
        userId ? getUnsubscribeUrl(userId, "subscription_cancelled") : undefined
      }
    >
      <Heading style={styles.heading}>Subscription Cancelled</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        We are sorry to see you go. Your <strong>{plan}</strong> subscription
        has been cancelled.
      </Text>

      <Section style={styles.infoSection}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoText}>
          You will continue to have access to your {plan} features until{" "}
          <strong>{accessUntil}</strong>. After that date, your account will
          revert to the free plan.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        We would love to hear your feedback. Was there something we could have
        done better? Simply reply to this email to let us know.
      </Text>

      <Section style={styles.reasonsSection}>
        <Text style={styles.reasonsTitle}>
          Before you go, here is what you will miss:
        </Text>
        <ul style={styles.reasonsList}>
          <li style={styles.reasonItem}>Unlimited searches and favorites</li>
          <li style={styles.reasonItem}>AI-powered remedy recommendations</li>
          <li style={styles.reasonItem}>Drug interaction checking</li>
          <li style={styles.reasonItem}>Priority support</li>
        </ul>
      </Section>

      <Text style={styles.paragraph}>
        Changed your mind? You can resubscribe anytime and pick up right where
        you left off.
      </Text>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={resubscribeUrl}>
          Resubscribe Now
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        If you have any questions about your account or need assistance, our
        support team is here to help.
      </Text>

      <Text style={styles.signature}>
        We hope to see you again soon!
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: {
    color: EMAIL_BRAND.textColor,
    fontSize: "24px",
    fontWeight: "bold" as const,
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },
  greeting: {
    color: EMAIL_BRAND.textColor,
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px 0",
  },
  paragraph: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0 0 16px 0",
  },
  infoSection: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  infoTitle: {
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  infoText: {
    color: "#92400e",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0",
  },
  reasonsSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  reasonsTitle: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 12px 0",
  },
  reasonsList: {
    margin: "0",
    paddingLeft: "20px",
  },
  reasonItem: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    lineHeight: "28px",
  },
  ctaSection: {
    margin: "32px 0",
    textAlign: "center" as const,
  },
  ctaButton: {
    backgroundColor: EMAIL_BRAND.primaryColor,
    borderRadius: "6px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "bold" as const,
    padding: "12px 32px",
    textDecoration: "none",
  },
  signature: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    lineHeight: "24px",
    margin: "24px 0 0 0",
  },
};

export default SubscriptionCancelledEmail;
