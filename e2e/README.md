# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the Remedi application using Playwright.

## Test Coverage

### Homepage Tests (`homepage.spec.ts`)
- Page loading and title verification
- Main heading display
- Search input functionality
- Navigation accessibility
- Keyboard navigation support
- Meta tags for SEO
- Console error detection
- Mobile responsiveness
- Dark mode toggle

### Search Tests (`search.spec.ts`)
- Search page display
- Basic search functionality
- Loading states
- Empty search handling
- Remedy detail navigation
- Search filters
- Search history (authenticated users)
- API error handling
- Keyboard accessibility
- URL query persistence

### Authentication Tests (`auth.spec.ts`)
- Sign in page display
- OAuth provider buttons (Google, GitHub)
- OAuth redirect flow
- User menu display (authenticated)
- Protected route access
- Form accessibility
- Sign out functionality
- Error handling
- Session persistence

## Running Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

## Writing Tests

### Basic Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-route');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await expect(page.getByRole('button')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait Appropriately**: Use `waitForTimeout` sparingly, prefer `waitForLoadState` or element visibility
3. **Test User Flows**: Focus on critical user journeys, not implementation details
4. **Handle Flakiness**: Use retry mechanisms and appropriate waits
5. **Accessibility First**: Test keyboard navigation and screen reader compatibility

### Common Patterns

```typescript
// Navigation
await page.goto('/');
await expect(page).toHaveURL(/\/expected-route/);

// Interactions
await page.getByRole('button', { name: /submit/i }).click();
await page.getByRole('textbox').fill('text');
await page.keyboard.press('Enter');

// Assertions
await expect(page.getByText('Success')).toBeVisible();
await expect(page).toHaveTitle(/Expected Title/);

// API Mocking
await page.route('**/api/endpoint', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mock' }),
  });
});
```

## CI/CD Integration

Tests are configured to run in CI environments. The configuration automatically:
- Disables `test.only` in CI
- Runs tests sequentially (not parallel)
- Uses 2 retries for flaky tests
- Generates HTML reports
- Captures screenshots on failure
- Records videos on failure

## Configuration

The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts).

Key settings:
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Test Directory**: `./e2e`
- **Browsers**: Chromium (Firefox and WebKit available)
- **Dev Server**: Automatically starts Next.js dev server
- **Retries**: 2 retries in CI, 0 in development
- **Timeouts**: 120s for server startup

## Debugging

### Debug Mode
```bash
npm run test:e2e:debug
```

This opens Playwright Inspector for step-by-step debugging.

### VS Code Extension
Install the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension for:
- Running tests from editor
- Setting breakpoints
- Viewing test results inline

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots in `test-results/`
- Videos in `test-results/`
- Traces for debugging

View traces:
```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Authentication in Tests

For tests requiring authentication:

```typescript
test('authenticated test', async ({ page, context }) => {
  // Mock session cookie
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  await page.goto('/protected-route');
  // Continue test...
});
```

## Mobile Testing

Tests can run on mobile viewports:

```typescript
test('mobile test', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // Test mobile-specific behavior
});
```

Or configure mobile devices in `playwright.config.ts`:

```typescript
{
  name: 'Mobile Chrome',
  use: { ...devices['Pixel 5'] },
}
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Debugging Guide](https://playwright.dev/docs/debug)
