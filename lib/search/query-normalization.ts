import { COMMON_SUFFIXES, SPELLING_VARIANTS } from "@/lib/constants";

const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;
const WHITESPACE_PATTERN = /\s+/g;

type VariantMatch = {
  standard: string;
  tokens: string[];
};

const SUFFIXES = new Set<string>(COMMON_SUFFIXES);

const VARIANT_MATCHES: VariantMatch[] = Object.entries(SPELLING_VARIANTS)
  .flatMap(([standard, variants]) =>
    variants.map((variant) => ({
      standard,
      tokens: tokenizeNormalizedValue(variant),
    })),
  )
  .filter((variant) => variant.tokens.length > 0)
  .sort((left, right) => right.tokens.length - left.tokens.length);

function tokenizeNormalizedValue(value: string): string[] {
  const normalized = value
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_PATTERN, " ")
    .trim();

  return normalized ? normalized.split(WHITESPACE_PATTERN) : [];
}

function isSuffixToken(token: string): boolean {
  if (SUFFIXES.has(token)) {
    return true;
  }

  if (token.endsWith("s")) {
    return SUFFIXES.has(token.slice(0, -1));
  }

  return false;
}

function findVariantMatch(
  tokens: string[],
  startIndex: number,
): VariantMatch | undefined {
  return VARIANT_MATCHES.find((variant) =>
    variant.tokens.every(
      (token, offset) => tokens[startIndex + offset] === token,
    ),
  );
}

export function normalizeSearchQuery(query: string): string {
  const normalizedTokens = tokenizeNormalizedValue(query);
  if (normalizedTokens.length === 0) {
    return "";
  }

  const replacedTokens: string[] = [];

  for (let index = 0; index < normalizedTokens.length; ) {
    const variant = findVariantMatch(normalizedTokens, index);

    if (variant) {
      replacedTokens.push(variant.standard);
      index += variant.tokens.length;
      continue;
    }

    const token = normalizedTokens[index];
    if (!token) {
      break;
    }

    replacedTokens.push(token);
    index += 1;
  }

  return replacedTokens.filter((token) => !isSuffixToken(token)).join(" ");
}
