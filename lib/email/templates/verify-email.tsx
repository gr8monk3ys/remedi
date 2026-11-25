/**
 * Email Verification Template
 *
 * Sent after sign-up, on a sign-in attempt with an unverified address, and to
 * the new address when a user changes their email.
 */

import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { VerifyEmailData } from "../types";
import { EMAIL_BRAND } from "../config";

export function VerifyEmailEmail({
  name,
  verifyUrl,
  expiresIn,
}: VerifyEmailData): React.ReactElement {
  return (
    <BaseLayout preview={`Verify your ${EMAIL_BRAND.name} email address`}>
      <Heading style={styles.heading}>Verify Your Email</Heading>

      <Text style={styles.paragraph}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        Confirm this email address to finish setting up your {EMAIL_BRAND.name}{" "}
        account. The link expires in <strong>{expiresIn}</strong>.
      </Text>

      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={verifyUrl}>
          Verify Email
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        If the button does not work, copy and paste this URL into your browser:
      </Text>
      <Text style={styles.urlText}>{verifyUrl}</Text>

      <Text style={styles.paragraph}>
        If you did not create an account, you can ignore this email.
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
  paragraph: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0 0 16px 0",
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
    padding: "14px 40px",
    textDecoration: "none",
  },
  urlText: {
    color: EMAIL_BRAND.primaryColor,
    fontSize: "12px",
    margin: "0 0 16px 0",
    wordBreak: "break-all" as const,
  },
};

export default VerifyEmailEmail;
