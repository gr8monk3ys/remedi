/**
 * Accessibility Utilities
 *
 * Provides utilities for improved keyboard navigation and screen reader support.
 * Follows WCAG 2.1 Level AA guidelines.
 *
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 */

/**
 * Trap focus within a container element
 * Useful for modals and dialogs
 *
 * @param container - The container element to trap focus within
 * @returns Cleanup function to remove event listeners
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = trapFocus(modalRef.current);
 *   return cleanup;
 * }, [isOpen]);
 * ```
 */
export function trapFocus(container: HTMLElement | null): () => void {
  if (!container) return () => {};

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Generate unique IDs for ARIA labels
 * Ensures consistency across renders
 */
let idCounter = 0;
export function generateId(prefix: string = 'remedi'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Announce message to screen readers
 * Creates a live region for dynamic content announcements
 *
 * @param message - Message to announce
 * @param priority - 'polite' (default) or 'assertive'
 *
 * @example
 * ```tsx
 * announceToScreenReader('Search results loaded', 'polite');
 * ```
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 * Useful for disabling animations
 *
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get color contrast ratio between two colors
 * Helps ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 *
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns Contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((val) => {
      const srgb = val / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Keyboard navigation handler for arrow keys
 * Useful for lists, grids, and custom widgets
 *
 * @param event - Keyboard event
 * @param items - Array of focusable elements
 * @param currentIndex - Currently focused index
 * @param options - Navigation options
 * @returns New index or null if no change
 */
export function handleArrowKeyNavigation(
  event: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    horizontal?: boolean;
    vertical?: boolean;
    loop?: boolean;
  } = {}
): number | null {
  const { horizontal = true, vertical = true, loop = true } = options;

  let newIndex: number | null = null;

  switch (event.key) {
    case 'ArrowRight':
      if (horizontal) {
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : currentIndex;
        }
      }
      break;
    case 'ArrowLeft':
      if (horizontal) {
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : currentIndex;
        }
      }
      break;
    case 'ArrowDown':
      if (vertical) {
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : currentIndex;
        }
      }
      break;
    case 'ArrowUp':
      if (vertical) {
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : currentIndex;
        }
      }
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = items.length - 1;
      break;
  }

  if (newIndex !== null && newIndex !== currentIndex) {
    event.preventDefault();
    items[newIndex]?.focus();
    return newIndex;
  }

  return null;
}

/**
 * Skip to main content handler
 * For "Skip to main content" accessibility link
 */
export function skipToMainContent(): void {
  const main = document.querySelector('main');
  if (main) {
    main.tabIndex = -1;
    main.focus();
    main.removeAttribute('tabindex');
  }
}

/**
 * Visually hidden CSS class name
 * For screen-reader-only content
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Focus visible CSS class name
 * For keyboard focus indicators
 */
export const FOCUS_VISIBLE_CLASS = 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';
