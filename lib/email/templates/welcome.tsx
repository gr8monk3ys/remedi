/**
 * Welcome Email Template
 *
 * Sent to new users when they sign up.
 */

import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { WelcomeEmailData } from "../types";
import {
  EMAIL_BRAND,
  getEmailUrl,
  EMAIL_URLS,
  getUnsubscribeUrl,
} from "../config";

interface WelcomeEmailProps extends WelcomeEmailData {
  userId?: string;
}

export function WelcomeEmail({
  name,
  loginUrl,
  userId,
}: WelcomeEmailProps): React.ReactElement {
  const effectiveLoginUrl = loginUrl || getEmailUrl(EMAIL_URLS.login);

  return (
    <BaseLayout
      preview={`Welcome to ${EMAIL_BRAND.name}, ${name}! Start exploring natural alternatives.`}
      unsubscribeUrl={userId ? getUnsubscribeUrl(userId, "welcome") : undefined}
    >
      <Heading style={styles.heading}>Welcome to {EMAIL_BRAND.name}!</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        Thank you for joining {EMAIL_BRAND.name}! We are excited to help you
        discover natural alternatives to pharmaceutical drugs.
      </Text>

      <Text style={styles.paragraph}>
        Our platform provides evidence-based information about natural remedies,
        helping you make informed decisions about your health journey.
      </Text>

      <Section style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Here is what you can do:</Text>
        <ul style={styles.featuresList}>
          <li style={styles.featureItem}>
            Search for natural alternatives to common medications
          </li>
          <li style={styles.featureItem}>
            View detailed information about remedies and their benefits
          </li>
          <li style={styles.featureItem}>
            Save your favorite remedies for quick access
          </li>
          <li style={styles.featureItem}>
            Get personalized recommendations based on your searches
          </li>
        </ul>
      </Section>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={effectiveLoginUrl}>
          Start Exploring
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        If you have any questions or need assistance, do not hesitate to reach
        out to our support team.
      </Text>

      <Text style={styles.signature}>
        Best regards,
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>

      <Section style={styles.disclaimerSection}>
        <Text style={styles.disclaimer}>
          <strong>Medical Disclaimer:</strong> The information provided by{" "}
          {EMAIL_BRAND.name} is for informational purposes only and is not
          intended as medical advice. Always consult with a qualified healthcare
          professional before making any changes to your medication or health
          routine.
        </Text>
      </Section>
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
  featuresSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  featuresTitle: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 12px 0",
  },
  featuresList: {
    margin: "0",
    paddingLeft: "20px",
  },
  featureItem: {
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
  disclaimerSection: {
    borderTop: "1px solid #e5e7eb",
    marginTop: "24px",
    paddingTop: "24px",
  },
  disclaimer: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "12px",
    fontStyle: "italic" as const,
    lineHeight: "18px",
    margin: "0",
  },
};

export default WelcomeEmail;
