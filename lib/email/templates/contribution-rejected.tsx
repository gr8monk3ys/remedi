/**
 * Contribution Rejected Email Template
 *
 * Sent when a user's remedy contribution has been rejected by a moderator.
 * Includes the moderator's note explaining the reason when available.
 */

import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { ContributionRejectedData } from "../types";
import { EMAIL_BRAND, getUnsubscribeUrl } from "../config";

interface ContributionRejectedEmailProps extends ContributionRejectedData {
  userId?: string;
}

export function ContributionRejectedEmail({
  name,
  remedyName,
  moderatorNote,
  contributeUrl,
  userId,
}: ContributionRejectedEmailProps): React.ReactElement {
  return (
    <BaseLayout
      preview={`Update on your remedy contribution "${remedyName}" on ${EMAIL_BRAND.name}.`}
      unsubscribeUrl={
        userId ? getUnsubscribeUrl(userId, "contribution_rejected") : undefined
      }
    >
      <Heading style={styles.heading}>Update on Your Contribution</Heading>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        Thank you for submitting <strong>{remedyName}</strong> to{" "}
        {EMAIL_BRAND.name}. After careful review, our moderation team was unable
        to approve this contribution at this time.
      </Text>

      {moderatorNote && (
        <Section style={styles.noteSection}>
          <Text style={styles.noteTitle}>Moderator Feedback</Text>
          <Text style={styles.noteText}>{moderatorNote}</Text>
        </Section>
      )}

      <Section style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Tips for Future Submissions</Text>
        <ul style={styles.tipsList}>
          <li style={styles.tipItem}>
            Provide detailed descriptions with accurate information
          </li>
          <li style={styles.tipItem}>
            Include scientific references or credible sources when possible
          </li>
          <li style={styles.tipItem}>
            Ensure the remedy name is specific and commonly recognized
          </li>
          <li style={styles.tipItem}>
            Add dosage information and precautions for safety
          </li>
        </ul>
      </Section>

      <Text style={styles.paragraph}>
        We encourage you to review the feedback above and consider resubmitting
        with the suggested improvements. Your contributions help make{" "}
        {EMAIL_BRAND.name} better for everyone.
      </Text>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={contributeUrl}>
          Submit Another Remedy
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        If you have questions about this decision or need guidance on your
        submission, please reply to this email and our team will be happy to
        help.
      </Text>

      <Text style={styles.signature}>
        Best regards,
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
  noteSection: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  noteTitle: {
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  noteText: {
    color: "#92400e",
    fontSize: "14px",
    fontStyle: "italic" as const,
    lineHeight: "22px",
    margin: "0",
  },
  tipsSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  tipsTitle: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 12px 0",
  },
  tipsList: {
    margin: "0",
    paddingLeft: "20px",
  },
  tipItem: {
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

export default ContributionRejectedEmail;
