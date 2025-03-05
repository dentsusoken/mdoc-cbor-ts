import { describe, expect, it } from 'vitest';
import { keyAuthorizationsSchema } from './KeyAuthorizations';

describe('KeyAuthorizations', () => {
  it('should accept valid key authorizations with all fields', () => {
    const validAuthorizations = {
      nameSpaces: ['org.iso.18013.5.1'],
      dataElements: {
        'org.iso.18013.5.1': ['given_name', 'family_name'],
      },
    };

    expect(() =>
      keyAuthorizationsSchema.parse(validAuthorizations)
    ).not.toThrow();
    const result = keyAuthorizationsSchema.parse(validAuthorizations);
    expect(result).toEqual(validAuthorizations);
  });

  it('should accept valid key authorizations with only nameSpaces', () => {
    const validAuthorizations = {
      nameSpaces: ['org.iso.18013.5.1'],
    };

    expect(() =>
      keyAuthorizationsSchema.parse(validAuthorizations)
    ).not.toThrow();
    const result = keyAuthorizationsSchema.parse(validAuthorizations);
    expect(result).toEqual(validAuthorizations);
  });

  it('should accept valid key authorizations with only dataElements', () => {
    const validAuthorizations = {
      dataElements: {
        'org.iso.18013.5.1': ['given_name', 'family_name'],
      },
    };

    expect(() =>
      keyAuthorizationsSchema.parse(validAuthorizations)
    ).not.toThrow();
    const result = keyAuthorizationsSchema.parse(validAuthorizations);
    expect(result).toEqual(validAuthorizations);
  });

  it('should accept empty object', () => {
    const emptyAuthorizations = {};
    expect(() =>
      keyAuthorizationsSchema.parse(emptyAuthorizations)
    ).not.toThrow();
    expect(keyAuthorizationsSchema.parse(emptyAuthorizations)).toEqual(
      emptyAuthorizations
    );
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {
        nameSpaces: [],
      },
      {
        nameSpaces: [123],
      },
      {
        dataElements: {
          'org.iso.18013.5.1': [],
        },
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => keyAuthorizationsSchema.parse(input)).toThrow();
    });
  });
});
