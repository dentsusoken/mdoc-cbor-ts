import { describe, it, expect } from 'vitest';
import { valueInvalidTypeMessage } from '../valueInvalidTypeMessage';

describe('valueInvalidTypeMessage', () => {
  it('returns formatted message for simple types', () => {
    const message = valueInvalidTypeMessage({
      expected: 'number',
      received: 'string',
    });
    expect(message).toBe('Expected number, received string');
  });

  it('supports complex type descriptions', () => {
    const message = valueInvalidTypeMessage({
      expected: 'Map<string, number[]>',
      received: 'Set<UUID>',
    });
    expect(message).toBe('Expected Map<string, number[]>, received Set<UUID>');
  });

  it('handles empty strings', () => {
    const message = valueInvalidTypeMessage({ expected: '', received: '' });
    expect(message).toBe('Expected , received ');
  });
});
