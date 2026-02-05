/**
 * Lightweight client-side experiment assignment.
 */

export function getOrSetExperimentVariant(
  experimentId: string,
  variants: string[],
): string {
  if (typeof window === "undefined") {
    return variants[0] || "control";
  }

  const key = `exp_${experimentId}`;
  const existing = window.localStorage.getItem(key);

  if (existing && variants.includes(existing)) {
    return existing;
  }

  const choice =
    variants[Math.floor(Math.random() * variants.length)] ??
    variants[0] ??
    "control";

  window.localStorage.setItem(key, choice);
  return choice;
}
