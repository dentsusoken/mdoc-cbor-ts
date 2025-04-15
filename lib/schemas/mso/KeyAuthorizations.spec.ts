import { describe, expect, it } from 'vitest';
import { keyAuthorizationsSchema } from './KeyAuthorizations';

describe('KeyAuthorizations', () => {
  it('should accept valid key authorizations with all fields', () => {
    const validAuthorizations = new Map<string, any>([
      ['nameSpaces', ['org.iso.18013.5.1']],
      [
        'dataElements',
        new Map<string, string[]>([
          ['org.iso.18013.5.1', ['given_name', 'family_name']],
        ]),
      ],
    ]);

    expect(() =>
      keyAuthorizationsSchema.parse(validAuthorizations)
    ).not.toThrow();
    const result = keyAuthorizationsSchema.parse(validAuthorizations);
    expect(result).toEqual({
      nameSpaces: ['org.iso.18013.5.1'],
      dataElements: {
        'org.iso.18013.5.1': ['given_name', 'family_name'],
      },
    });
  });

  it('should accept valid key authorizations with only nameSpaces', () => {
    const validAuthorizations = new Map<string, any>([
      ['nameSpaces', ['org.iso.18013.5.1']],
    ]);

    expect(() =>
      keyAuthorizationsSchema.parse(validAuthorizations)
    ).not.toThrow();
    const result = keyAuthorizationsSchema.parse(validAuthorizations);
    expect(result).toEqual({
      nameSpaces: ['org.iso.18013.5.1'],
    });
  });

  it('should accept valid key authorizations with only dataElements', () => {
    const validAuthorizations = new Map<string, any>([
      [
        'dataElements',
        new Map<string, string[]>([
          ['org.iso.18013.5.1', ['given_name', 'family_name']],
        ]),
      ],
    ]);

    expect(() =>
      keyAuthorizationsSchema.parse(validAuthorizations)
    ).not.toThrow();
    const result = keyAuthorizationsSchema.parse(validAuthorizations);
    expect(result).toEqual({
      dataElements: {
        'org.iso.18013.5.1': ['given_name', 'family_name'],
      },
    });
  });

  it('should accept empty object', () => {
    const emptyAuthorizations = new Map<string, any>();
    expect(() =>
      keyAuthorizationsSchema.parse(emptyAuthorizations)
    ).not.toThrow();
    expect(keyAuthorizationsSchema.parse(emptyAuthorizations)).toEqual({});
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      new Map<string, any>([['nameSpaces', []]]),
      new Map<string, any>([['nameSpaces', [123]]]),
      new Map<string, any>([
        ['dataElements', new Map<string, any>([['org.iso.18013.5.1', []]])],
      ]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => keyAuthorizationsSchema.parse(input)).toThrow();
    });
  });
});
