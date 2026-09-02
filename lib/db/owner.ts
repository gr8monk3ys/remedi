import "server-only";

/**
 * Ownership filters for per-visitor resources.
 *
 * Favorites, search history and filter preferences belong to either a
 * signed-in user or an anonymous session. Every query over them must be
 * narrowed to one of those, because an unfiltered query returns — or deletes —
 * every row in the table.
 *
 * That rule was previously a comment and a hand-written `if` repeated at seven
 * call sites, each returning a different empty value. It lives here now, so a
 * new query cannot be written without confronting it.
 */

export type OwnerCondition = { userId: string } | { sessionId: string };

/**
 * Build the OR conditions identifying a resource's owner.
 *
 * Returns `null` when neither identifier was supplied. A null result must
 * never be treated as "match everything" — callers return their own empty
 * value for it.
 */
export function ownerConditions(
  userId?: string | null,
  sessionId?: string | null,
): OwnerCondition[] | null {
  const conditions: OwnerCondition[] = [];
  if (sessionId) conditions.push({ sessionId });
  if (userId) conditions.push({ userId });

  return conditions.length > 0 ? conditions : null;
}
