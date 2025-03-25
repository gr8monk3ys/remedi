import type { Reference } from "@/lib/types";

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

// https://www.crossref.org/blog/dois-and-matching-regular-expressions/
function extractDoi(value: string): string | null {
  const match = value.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i);
  return match?.[1] ?? null;
}

function tryParseReferenceJson(value: string): Reference | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const title = (parsed as { title?: unknown }).title;
    const url = (parsed as { url?: unknown }).url;
    if (typeof title !== "string" || typeof url !== "string") return null;
    if (!title.trim() || !url.trim()) return null;
    return { title: title.trim(), url: url.trim() };
  } catch {
    return null;
  }
}

export function normalizeReference(input: unknown): Reference | null {
  if (!input) return null;

  if (typeof input === "object") {
    const title = (input as { title?: unknown }).title;
    const url = (input as { url?: unknown }).url;
    if (typeof title === "string" && typeof url === "string") {
      const t = title.trim();
      const u = url.trim();
      if (!t) return null;
      return {
        title: t,
        url:
          u || `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(t)}`,
      };
    }
    return null;
  }

  if (typeof input !== "string") return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsedJson = tryParseReferenceJson(trimmed);
  if (parsedJson) return parsedJson;

  if (isLikelyUrl(trimmed)) {
    return { title: trimmed, url: trimmed };
  }

  const doi = extractDoi(trimmed);
  if (doi) {
    return { title: trimmed, url: `https://doi.org/${doi}` };
  }

  // Generic fallback: make the reference clickable via PubMed search.
  return {
    title: trimmed,
    url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(trimmed)}`,
  };
}

export function normalizeReferences(inputs: unknown): Reference[] {
  if (!inputs) return [];
  if (!Array.isArray(inputs)) return [];
  return inputs
    .map(normalizeReference)
    .filter((r): r is Reference => r !== null);
}
