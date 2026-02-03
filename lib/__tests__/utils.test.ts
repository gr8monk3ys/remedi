/**
 * Unit Tests for Utility Functions
 *
 * Tests the cn() function for Tailwind CSS class merging.
 */

import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active'
    );
  });

  it('should merge conflicting Tailwind classes', () => {
    // twMerge should keep the last conflicting class
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should handle objects with boolean values', () => {
    expect(
      cn({
        foo: true,
        bar: false,
        baz: true,
      })
    ).toBe('foo baz');
  });

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
  });

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('should handle complex combinations', () => {
    const result = cn(
      'base',
      true && 'conditional',
      false && 'skipped',
      ['array', 'classes'],
      { object: true, skipped: false },
      undefined,
      'final'
    );
    expect(result).toBe('base conditional array classes object final');
  });

  it('should handle Tailwind responsive modifiers', () => {
    expect(cn('p-2 md:p-4', 'p-3')).toBe('md:p-4 p-3');
  });

  it('should handle Tailwind state modifiers', () => {
    expect(cn('hover:bg-blue-500', 'hover:bg-red-500')).toBe('hover:bg-red-500');
  });

  it('should preserve non-conflicting classes', () => {
    expect(cn('font-bold', 'text-center', 'p-4')).toBe('font-bold text-center p-4');
  });

  it('should handle numeric values (from clsx)', () => {
    // @ts-expect-error Testing numeric input
    expect(cn('foo', 0, 1, 'bar')).toBe('foo 1 bar');
  });
});
