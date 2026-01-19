import { describe, it, expect } from 'vitest';
import { levenshteinDistance, stringSimilarity, fuzzySearch } from '../fuzzy-search';

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should calculate distance for simple changes', () => {
    expect(levenshteinDistance('hello', 'hallo')).toBe(1); // substitution
    expect(levenshteinDistance('hello', 'helllo')).toBe(1); // insertion
    expect(levenshteinDistance('hello', 'helo')).toBe(1); // deletion
  });

  it('should calculate distance for completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });

  it('should handle empty strings', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  it('should be case-sensitive', () => {
    expect(levenshteinDistance('Hello', 'hello')).toBe(1);
  });

  it('should handle common pharmaceutical misspellings', () => {
    expect(levenshteinDistance('ibuprofen', 'ibuprofin')).toBe(1);
    expect(levenshteinDistance('acetaminophen', 'acetaminophine')).toBe(2);
    expect(levenshteinDistance('tylenol', 'tylanol')).toBe(1);
  });
});

describe('stringSimilarity', () => {
  it('should return 1 for identical strings', () => {
    expect(stringSimilarity('hello', 'hello')).toBe(1);
    expect(stringSimilarity('', '')).toBe(1);
  });

  it('should return 0 for completely different strings of same length', () => {
    expect(stringSimilarity('abc', 'xyz')).toBe(0);
  });

  it('should return 0 when one string is empty', () => {
    expect(stringSimilarity('', 'hello')).toBe(0);
    expect(stringSimilarity('hello', '')).toBe(0);
  });

  it('should return high similarity for similar strings', () => {
    const similarity = stringSimilarity('ibuprofen', 'ibuprofin');
    expect(similarity).toBeGreaterThan(0.8);
  });

  it('should be case-insensitive', () => {
    expect(stringSimilarity('Hello', 'hello')).toBe(1);
    expect(stringSimilarity('IBUPROFEN', 'ibuprofen')).toBe(1);
  });

  it('should calculate similarity for typos', () => {
    expect(stringSimilarity('vitamin', 'vitamine')).toBeGreaterThan(0.8);
    expect(stringSimilarity('melatonin', 'melatonine')).toBeGreaterThan(0.8);
  });
});

describe('fuzzySearch', () => {
  const testItems = [
    { id: '1', name: 'Ibuprofen', category: 'Pain Reliever' },
    { id: '2', name: 'Vitamin D', category: 'Supplement' },
    { id: '3', name: 'Melatonin', category: 'Sleep Aid' },
    { id: '4', name: 'Fish Oil', category: 'Supplement' },
  ];

  it('should find exact matches with high scores', () => {
    const results = fuzzySearch(
      'ibuprofen',
      testItems,
      (item) => item.name
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Ibuprofen');
    expect(results[0].similarityScore).toBeGreaterThan(0.9);
  });

  it('should find fuzzy matches', () => {
    const results = fuzzySearch(
      'ibuprofin', // common misspelling
      testItems,
      (item) => item.name
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Ibuprofen');
  });

  it('should be case-insensitive', () => {
    const results = fuzzySearch(
      'VITAMIN',
      testItems,
      (item) => item.name
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Vitamin D');
  });

  it('should filter out low-score matches', () => {
    const results = fuzzySearch(
      'aspirin', // not in list
      testItems,
      (item) => item.name
    );

    // Should not return items with very low similarity
    expect(results.every(r => r.similarityScore > 0.2)).toBe(true);
  });

  it('should search across multiple fields', () => {
    const results = fuzzySearch(
      'supplement',
      testItems,
      (item) => `${item.name} ${item.category}`
    );

    expect(results.length).toBe(2); // Vitamin D and Fish Oil
    expect(results.every(r => r.category === 'Supplement')).toBe(true);
  });

  it('should sort results by score descending', () => {
    const results = fuzzySearch(
      'mel',
      testItems,
      (item) => item.name
    );

    if (results.length > 1) {
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].similarityScore).toBeGreaterThanOrEqual(
          results[i + 1].similarityScore
        );
      }
    }
  });

  it('should handle empty query', () => {
    const results = fuzzySearch(
      '',
      testItems,
      (item) => item.name
    );

    // Should not crash and should handle gracefully
    expect(Array.isArray(results)).toBe(true);
  });

  it('should handle empty items array', () => {
    const results = fuzzySearch(
      'test',
      [],
      (item: { name: string }) => item.name
    );

    expect(results).toEqual([]);
  });

  it('should prefer exact substring matches over fuzzy matches', () => {
    const items = [
      { id: '1', name: 'Ibuprofen Plus' },
      { id: '2', name: 'Ibuprofin' }, // Similar but not exact
    ];

    const results = fuzzySearch(
      'ibuprofen',
      items,
      (item) => item.name
    );

    // Exact substring match should score higher
    expect(results[0].name).toBe('Ibuprofen Plus');
  });
});
