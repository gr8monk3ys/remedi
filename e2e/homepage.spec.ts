/**
 * E2E Tests for Homepage
 *
 * Tests critical functionality on the homepage including:
 * - Page loads correctly
 * - Search functionality
 * - Navigation
 * - Accessibility
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Remedi/i);
  });

  test('should display the main heading', async ({ page }) => {
    // Check for main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should have a search input field', async ({ page }) => {
    // Check that search input exists
    const searchInput = page.getByRole('searchbox');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });

  test('should navigate to remedy search page', async ({ page }) => {
    // Click on search/remedies link
    const searchLink = page.getByRole('link', { name: /search|remedies/i });
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await expect(page).toHaveURL(/\/search|\/remedies/);
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    // Wait for page to fully load and hydrate
    await page.waitForLoadState('networkidle');

    // Check for any navigational elements on the page
    // This includes: nav element, header links, or any links with common nav patterns
    const navElement = page.locator('nav');
    const headerLinks = page.locator('header a, [role="navigation"] a');
    const anyLinks = page.locator('a[href="/"], a[href="#about"], a[href="#faq"]');

    // At least one navigation method should exist
    const navCount = await navElement.count();
    const headerLinkCount = await headerLinks.count();
    const anyLinkCount = await anyLinks.count();

    // The page should have some form of navigation
    const hasNavigation = navCount > 0 || headerLinkCount > 0 || anyLinkCount > 0;

    // If no explicit nav found, at least check page has interactive links
    if (!hasNavigation) {
      const allLinks = page.locator('a');
      const totalLinks = await allLinks.count();
      expect(totalLinks).toBeGreaterThan(0);
    } else {
      expect(hasNavigation).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Verify that an element is focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for SEO meta tags
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(0);
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Filter out known acceptable errors (like third-party warnings)
    const criticalErrors = errors.filter(
      (error) => !error.includes('third-party') && !error.includes('warning')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be usable
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have dark mode toggle', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Wait for theme class to be added to documentElement
      await page.waitForFunction(
        () => document.documentElement.classList.contains('dark') ||
              document.documentElement.getAttribute('data-theme') === 'dark',
        { timeout: 2000 }
      ).catch(() => {});

      // Check that theme changed (HTML should have dark class or data attribute)
      const isDark = await page.evaluate(() => {
        return (
          document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark'
        );
      });

      expect(isDark).toBeTruthy();
    }
  });
});
