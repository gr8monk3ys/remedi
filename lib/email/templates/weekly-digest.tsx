/**
 * Weekly Digest Email Template
 *
 * Sent weekly to users who opt in, summarizing activity and new content.
 */

import { Button, Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { WeeklyDigestData } from "../types";
import {
  EMAIL_BRAND,
  getEmailUrl,
  EMAIL_URLS,
  getUnsubscribeUrl,
} from "../config";

interface WeeklyDigestEmailProps extends WeeklyDigestData {
  userId?: string;
  personalizedRemedies?: WeeklyDigestData["personalizedRemedies"];
  interactionAlerts?: WeeklyDigestData["interactionAlerts"];
  journalSummary?: WeeklyDigestData["journalSummary"];
  aiInsight?: WeeklyDigestData["aiInsight"];
}

export function WeeklyDigestEmail({
  name,
  newRemedies,
  topSearches,
  savedRemedies,
  searchCount,
  periodStart,
  periodEnd,
  userId,
  personalizedRemedies,
  interactionAlerts,
  journalSummary,
  aiInsight,
}: WeeklyDigestEmailProps): React.ReactElement {
  return (
    <BaseLayout
      preview={`Your weekly ${EMAIL_BRAND.name} digest for ${periodStart} - ${periodEnd}`}
      unsubscribeUrl={
        userId ? getUnsubscribeUrl(userId, "weekly_digest") : undefined
      }
    >
      <Heading style={styles.heading}>Your Weekly Digest</Heading>

      <Text style={styles.periodText}>
        {periodStart} - {periodEnd}
      </Text>

      <Text style={styles.greeting}>Hi {name},</Text>

      <Text style={styles.paragraph}>
        Here is a summary of your activity and what is new on {EMAIL_BRAND.name}{" "}
        this week.
      </Text>

      {/* AI Insight (Premium) */}
      {aiInsight && (
        <Section style={styles.aiInsightSection}>
          <Text style={styles.aiInsightTitle}>AI Health Insight</Text>
          <Text style={styles.aiInsightText}>{aiInsight}</Text>
        </Section>
      )}

      {/* Activity Summary */}
      <Section style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <table style={styles.statsTable}>
          <tbody>
            <tr>
              <td style={styles.statCell}>
                <Text style={styles.statNumber}>{searchCount}</Text>
                <Text style={styles.statLabel}>Searches</Text>
              </td>
              <td style={styles.statCell}>
                <Text style={styles.statNumber}>{savedRemedies}</Text>
                <Text style={styles.statLabel}>Saved Remedies</Text>
              </td>
              {journalSummary && (
                <td style={styles.statCell}>
                  <Text style={styles.statNumber}>
                    {journalSummary.entriesThisWeek}
                  </Text>
                  <Text style={styles.statLabel}>Journal Entries</Text>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Journal Summary (Premium) */}
      {journalSummary && (
        <Section style={styles.journalSection}>
          <Text style={styles.sectionTitle}>Journal This Week</Text>
          <Text style={styles.paragraph}>
            You logged {journalSummary.entriesThisWeek} entries with an average
            effectiveness rating of {journalSummary.avgRating}/5.
            {journalSummary.topRemedy &&
              ` Your most-tracked remedy was ${journalSummary.topRemedy}.`}
          </Text>
        </Section>
      )}

      {/* Interaction Alerts (Basic+) */}
      {interactionAlerts && interactionAlerts.length > 0 && (
        <Section style={styles.alertSection}>
          <Text style={styles.alertTitle}>Interaction Alerts</Text>
          <Text style={styles.sectionSubtitle}>
            Potential interactions detected with your medication cabinet:
          </Text>
          {interactionAlerts.map((alert, index) => (
            <div key={index} style={styles.alertItem}>
              <Text style={styles.alertItemTitle}>
                {alert.medication} + {alert.substance}
              </Text>
              <Text style={styles.alertItemSeverity}>
                Severity: {alert.severity}
              </Text>
              <Text style={styles.alertItemDesc}>{alert.description}</Text>
            </div>
          ))}
        </Section>
      )}

      {/* Personalized Remedies (Basic+) */}
      {personalizedRemedies && personalizedRemedies.length > 0 && (
        <Section style={styles.remediesSection}>
          <Text style={styles.sectionTitle}>Personalized For You</Text>
          <Text style={styles.sectionSubtitle}>
            New remedies matching your health profile:
          </Text>
          {personalizedRemedies.slice(0, 5).map((remedy, index) => (
            <div key={index} style={styles.remedyItem}>
              <Link href={remedy.url} style={styles.remedyLink}>
                {remedy.name}
              </Link>
              <Text style={styles.remedyCategory}>
                {remedy.category} — {remedy.matchReason}
              </Text>
            </div>
          ))}
        </Section>
      )}

      {/* New Remedies */}
      {newRemedies.length > 0 && (
        <Section style={styles.remediesSection}>
          <Text style={styles.sectionTitle}>New Remedies Added</Text>
          <Text style={styles.sectionSubtitle}>
            Check out these newly added natural alternatives:
          </Text>
          {newRemedies.slice(0, 5).map((remedy, index) => (
            <div key={index} style={styles.remedyItem}>
              <Link href={remedy.url} style={styles.remedyLink}>
                {remedy.name}
              </Link>
              <Text style={styles.remedyCategory}>{remedy.category}</Text>
            </div>
          ))}
          {newRemedies.length > 5 && (
            <Text style={styles.moreText}>
              + {newRemedies.length - 5} more new remedies
            </Text>
          )}
        </Section>
      )}

      {/* Top Searches */}
      {topSearches.length > 0 && (
        <Section style={styles.searchesSection}>
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <Text style={styles.sectionSubtitle}>
            Popular searches in our community this week:
          </Text>
          <ol style={styles.searchList}>
            {topSearches.slice(0, 5).map((search, index) => (
              <li key={index} style={styles.searchItem}>
                <span style={styles.searchQuery}>{search.query}</span>
                <span style={styles.searchCount}>
                  {search.count.toLocaleString()} searches
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* CTA */}
      <Section style={styles.ctaSection}>
        <Button style={styles.ctaButton} href={getEmailUrl(EMAIL_URLS.home)}>
          Explore More Remedies
        </Button>
      </Section>

      {/* Tips */}
      <Section style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Tip of the Week</Text>
        <Text style={styles.tipsText}>
          Did you know you can save remedies to custom collections? Organize
          your favorites by health goal, family member, or any category that
          works for you!
        </Text>
      </Section>

      <Text style={styles.signature}>
        Stay healthy!
        <br />
        The {EMAIL_BRAND.name} Team
      </Text>

      <Section style={styles.preferencesSection}>
        <Text style={styles.preferencesText}>
          <Link
            href={
              userId
                ? getUnsubscribeUrl(userId, "weekly_digest")
                : getEmailUrl(EMAIL_URLS.unsubscribe)
            }
            style={styles.preferencesLink}
          >
            Manage email preferences
          </Link>{" "}
          to update how often you receive digests.
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
    margin: "0 0 8px 0",
    textAlign: "center" as const,
  },
  periodText: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "14px",
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
  statsSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  sectionTitle: {
    color: EMAIL_BRAND.textColor,
    fontSize: "16px",
    fontWeight: "bold" as const,
    margin: "0 0 16px 0",
  },
  sectionSubtitle: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "13px",
    margin: "0 0 16px 0",
  },
  statsTable: {
    width: "100%",
  },
  statCell: {
    padding: "8px",
    textAlign: "center" as const,
    width: "50%",
  },
  statNumber: {
    color: EMAIL_BRAND.primaryColor,
    fontSize: "32px",
    fontWeight: "bold" as const,
    margin: "0",
  },
  statLabel: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "12px",
    margin: "4px 0 0 0",
  },
  remediesSection: {
    margin: "24px 0",
  },
  remedyItem: {
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 0",
  },
  remedyLink: {
    color: EMAIL_BRAND.primaryColor,
    fontSize: "14px",
    fontWeight: "500" as const,
    textDecoration: "none",
  },
  remedyCategory: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "12px",
    margin: "4px 0 0 0",
  },
  moreText: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "13px",
    fontStyle: "italic" as const,
    margin: "12px 0 0 0",
  },
  searchesSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "20px",
  },
  searchList: {
    margin: "0",
    paddingLeft: "20px",
  },
  searchItem: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    lineHeight: "28px",
  },
  searchQuery: {
    fontWeight: "500" as const,
  },
  searchCount: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "12px",
    marginLeft: "8px",
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
  tipsSection: {
    backgroundColor: "#eff6ff",
    border: "1px solid #3b82f6",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "16px",
  },
  tipsTitle: {
    color: "#1e40af",
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  tipsText: {
    color: "#1e40af",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0",
  },
  signature: {
    color: EMAIL_BRAND.textColor,
    fontSize: "14px",
    lineHeight: "24px",
    margin: "24px 0 0 0",
  },
  preferencesSection: {
    borderTop: "1px solid #e5e7eb",
    marginTop: "24px",
    paddingTop: "16px",
    textAlign: "center" as const,
  },
  preferencesText: {
    color: EMAIL_BRAND.footerColor,
    fontSize: "12px",
    margin: "0",
  },
  preferencesLink: {
    color: EMAIL_BRAND.primaryColor,
    textDecoration: "none",
  },
  aiInsightSection: {
    backgroundColor: "#faf5ff",
    border: "1px solid #a855f7",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "16px",
  },
  aiInsightTitle: {
    color: "#7e22ce",
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  aiInsightText: {
    color: "#6b21a8",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0",
  },
  journalSection: {
    margin: "24px 0",
  },
  alertSection: {
    backgroundColor: "#fffbeb",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    margin: "24px 0",
    padding: "16px",
  },
  alertTitle: {
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  alertItem: {
    borderBottom: "1px solid #fde68a",
    padding: "8px 0",
  },
  alertItemTitle: {
    color: "#92400e",
    fontSize: "13px",
    fontWeight: "500" as const,
    margin: "0",
  },
  alertItemSeverity: {
    color: "#b45309",
    fontSize: "12px",
    margin: "2px 0 0 0",
  },
  alertItemDesc: {
    color: "#78350f",
    fontSize: "12px",
    margin: "4px 0 0 0",
  },
};

export default WeeklyDigestEmail;
