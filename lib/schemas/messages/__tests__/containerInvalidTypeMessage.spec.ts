import { describe, it, expect } from 'vitest';
import { containerInvalidTypeMessage } from '../containerInvalidTypeMessage';

describe('containerInvalidTypeMessage', () => {
  it('should format basic expected vs received types', () => {
    const result = containerInvalidTypeMessage({
      target: 'Tags',
      expected: 'array',
      received: 'Object',
    });
    expect(result).toBe('Tags: Expected array, received Object');
  });

  it('should work with map types', () => {
    const result = containerInvalidTypeMessage({
      target: 'Headers',
      expected: 'map',
      received: 'Array',
    });
    expect(result).toBe('Headers: Expected map, received Array');
  });

  it('should work with primitive types', () => {
    const cases = [
      ['User', 'string', 'Number', 'User: Expected string, received Number'],
      [
        'Config',
        'number',
        'String',
        'Config: Expected number, received String',
      ],
      [
        'Flag',
        'boolean',
        'undefined',
        'Flag: Expected boolean, received undefined',
      ],
    ] as const;

    for (const [target, expected, received, message] of cases) {
      const result = containerInvalidTypeMessage({
        target,
        expected,
        received,
      });
      expect(result).toBe(message);
    }
  });
});
