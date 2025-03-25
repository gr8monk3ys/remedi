/**
 * Fuzzy search utility functions
 */

/**
 * Calculate the Levenshtein distance between two strings
 * This measures how many character changes are needed to transform one string into another
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity between two strings (0-1 scale)
 * 1 means identical, 0 means completely different
 */
export function stringSimilarity(str1: string, str2: string): number {
  if (!str1.length && !str2.length) return 1; // Both empty = identical
  if (!str1.length || !str2.length) return 0; // One empty = completely different

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);

  // Convert distance to similarity score (0-1)
  return 1 - distance / maxLength;
}

/**
 * Rank search results by relevance
 * @param query The search query
 * @param items Array of items to search
 * @param getSearchableText Function to extract searchable text from an item
 * @returns Array of items sorted by relevance with added similarity score
 */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  getSearchableText: (item: T) => string,
): Array<T & { similarityScore: number }> {
  const lowerQuery = query.toLowerCase();

  // Calculate similarity scores for all items
  const scoredItems = items.map((item) => {
    const text = getSearchableText(item).toLowerCase();

    // Calculate different scoring methods
    const exactMatchScore = text.includes(lowerQuery) ? 1 : 0;
    const similarityScore = stringSimilarity(lowerQuery, text);

    // Weight exact matches higher than fuzzy matches
    const finalScore = exactMatchScore * 0.7 + similarityScore * 0.3;

    return {
      ...item,
      similarityScore: finalScore,
    };
  });

  // Filter out very low scores and sort by score (highest first)
  return scoredItems
    .filter((item) => item.similarityScore > 0.2) // Only reasonably good matches
    .sort((a, b) => b.similarityScore - a.similarityScore);
}
