const BASE = "http://same-origin.invalid";

/**
 * Reduce a `redirect_url` query value to a same-origin path.
 *
 * Anything that resolves to another origin (`https://evil.example`,
 * `//evil.example`, `javascript:`) becomes "/", so the sign-in flow cannot be
 * used as an open redirect.
 */
export function safeRedirectPath(input: string | null | undefined): string {
  if (!input || !URL.canParse(input, BASE)) return "/";
  const url = new URL(input, BASE);
  if (url.origin !== BASE) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
