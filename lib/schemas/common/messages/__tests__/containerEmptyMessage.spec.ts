import { describe, it, expect } from 'vitest';
import { containerEmptyMessage } from '../containerEmptyMessage';

describe('containerEmptyMessage', () => {
  it('should format message for a given target', () => {
    const result = containerEmptyMessage('Tags');
    expect(result).toBe('Tags: At least one entry must be provided.');
  });

  it('should work with various target names', () => {
    const cases = [
      ['Items', 'Items: At least one entry must be provided.'],
      ['UserData', 'UserData: At least one entry must be provided.'],
    ] as const;

    for (const [target, expected] of cases) {
      expect(containerEmptyMessage(target)).toBe(expected);
    }
  });
});
