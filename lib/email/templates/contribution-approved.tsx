/**
 * Contribution Approved Email Template
 *
 * Sent when a user's remedy contribution has been approved by a moderator.
 */

import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { ContributionApprovedData } from "../types";
import { EMAIL_BRAND, getUnsubscribeUrl } from "../config";

interface ContributionApprovedEmailProps extends ContributionApprovedData {
  userId?: string;
}

export function ContributionApprovedEmail({
  name,
  remedyName,
  remedyUrl,
  userId,
}: ContributionApprovedEmailProps): React.ReactElement {
  return (
    <BaseLayout
      preview={`Great news! Your remedy "${remedyName}" has been approved on ${EMAIL_BRAND.name}.`}
      unsubscribeUrl={
        userId ? getUnsubscribeUrl(userId, "contribution_approved") : undefined
      }
    >
      <Heading style={styles.heading}>Contribution Approved!</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        Great news! Your remedy contribution <strong>{remedyName}</strong> has
        been reviewed and approved by our moderation team. It is now live on{" "}
        {EMAIL_BRAND.name} and available for other users to discover.
      </Text>

      <Section style={styles.successSection}>
        <Text style={styles.successIcon}>&#10003;</Text>
        <Text style={styles.successTitle}>{remedyName} is now live</Text>
        <Text style={styles.successText}>
          Your contribution helps others find natural alternatives. Thank you
          for being part of our community!
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={remedyUrl}>
          View Your Remedy
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        Want to contribute more? We welcome additional remedies, especially
        those backed by scientific research. Every contribution helps our
        community grow.
      </Text>

      <Text style={styles.signature}>
        Thank you for contributing!
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: {
    color: EMAIL_BRAND.primaryColor,
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
  successSection: {
    backgroundColor: "#f0fdf4",
    border: `1px solid ${EMAIL_BRAND.primaryColor}`,
    borderRadius: "8px",
    margin: "24px 0",
    padding: "24px",
    textAlign: "center" as const,
  },
  successIcon: {
    color: EMAIL_BRAND.primaryColor,
    fontSize: "36px",
    fontWeight: "bold" as const,
    margin: "0 0 12px 0",
  },
  successTitle: {
    color: EMAIL_BRAND.textColor,
    fontSize: "18px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  successText: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0",
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

export default ContributionApprovedEmail;
