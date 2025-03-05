import { describe, expect, it } from 'vitest';
import { nameSpaceSchema } from './NameSpace';

describe('NameSpace', () => {
  it('should accept valid string namespaces', () => {
    const validNamespaces = [
      'org.iso.18013.5.1',
      'com.example.namespace',
      'test.namespace',
      'a.b.c',
    ];

    validNamespaces.forEach((namespace) => {
      expect(() => nameSpaceSchema.parse(namespace)).not.toThrow();
      expect(nameSpaceSchema.parse(namespace)).toBe(namespace);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      123,
      true,
      null,
      undefined,
      { key: 'value' },
      [1, 2, 3],
    ];

    invalidInputs.forEach((input) => {
      expect(() => nameSpaceSchema.parse(input)).toThrow();
    });
  });
});
