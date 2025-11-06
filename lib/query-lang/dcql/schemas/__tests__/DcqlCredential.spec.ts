import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlCredentialSchema } from '../DcqlCredential';

describe('dcqlCredentialSchema', () => {
  describe('should accept valid DCQL credentials', () => {
    it('accepts credential with required fields only', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
      });
      expect(result).toEqual({
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
        multiple: false,
      });
    });

    it('accepts credential with all fields', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-2',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            values: ['John', 'Jane'],
            intent_to_retain: true,
          },
        ],
        multiple: true,
      });
      expect(result).toEqual({
        id: 'credential-2',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            values: ['John', 'Jane'],
            intent_to_retain: true,
          },
        ],
        multiple: true,
      });
    });

    it('defaults multiple to false when omitted', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-3',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
      });
      expect(result.multiple).toBe(false);
    });

    it('accepts undefined claims', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-4',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
      });
      expect(result.claims).toBeUndefined();
    });

    it('accepts credential with claim_sets', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-5',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
        claim_sets: [
          ['org.iso.18013.5.1.mDL.given_name'],
          [
            'org.iso.18013.5.1.mDL.family_name',
            'org.iso.18013.5.1.mDL.birth_date',
          ],
        ],
      });
      expect(result.claim_sets).toEqual([
        ['org.iso.18013.5.1.mDL.given_name'],
        [
          'org.iso.18013.5.1.mDL.family_name',
          'org.iso.18013.5.1.mDL.birth_date',
        ],
      ]);
    });

    it('accepts credential with both claims and claim_sets', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-6',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
          },
        ],
        claim_sets: [
          [
            'org.iso.18013.5.1.mDL.given_name',
            'org.iso.18013.5.1.mDL.family_name',
          ],
        ],
      });
      expect(result.claims).toHaveLength(1);
      expect(result.claim_sets).toHaveLength(1);
    });

    it('accepts undefined claim_sets', () => {
      const result = dcqlCredentialSchema.parse({
        id: 'credential-7',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
      });
      expect(result.claim_sets).toBeUndefined();
    });
  });

  describe('should reject invalid DCQL credentials', () => {
    it('rejects missing id', () => {
      try {
        dcqlCredentialSchema.parse({
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['id']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects missing format', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format']);
        expect(zodError.issues[0].message).toBe(
          'Invalid literal value, expected "mso_mdoc"'
        );
      }
    });

    it('rejects missing meta', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['meta']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects invalid format value', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'invalid',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format']);
        expect(zodError.issues[0].message).toBe(
          'Invalid literal value, expected "mso_mdoc"'
        );
      }
    });

    it('rejects id that is not a string', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 123,
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['id']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects format that is not the literal value', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'other_format',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format']);
        expect(zodError.issues[0].message).toBe(
          'Invalid literal value, expected "mso_mdoc"'
        );
      }
    });

    it('rejects meta with missing doctype_value', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['meta', 'doctype_value']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects meta with empty doctype_value', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: '',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['meta', 'doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects claims that are not an array', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claims']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects empty claims array', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claims']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects multiple that is not a boolean', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          multiple: 'true',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['multiple']);
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received string'
        );
      }
    });

    it('rejects claims array with invalid claim', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              path: 'invalid',
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claims', 0, 'path']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects claim_sets that are not an array', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects empty claim_sets array', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects claim_sets array with non-array element', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: ['not-an-array'],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects claim_sets array with empty string element', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [['']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects claim_sets array with empty inner array', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [[]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0]);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid credentials', () => {
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        }).success
      ).toBe(true);
    });

    it('returns error for invalid credentials', () => {
      expect(
        dcqlCredentialSchema.safeParse({
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        }).success
      ).toBe(false);
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'invalid',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
        }).success
      ).toBe(false);
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [],
        }).success
      ).toBe(false);
    });

    it('returns success for valid credentials with claim_sets', () => {
      const result = dcqlCredentialSchema.safeParse({
        id: 'test',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
        claim_sets: [['org.iso.18013.5.1.mDL.given_name']],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.claim_sets).toEqual([
          ['org.iso.18013.5.1.mDL.given_name'],
        ]);
      }
    });

    it('returns success for valid credentials without claim_sets', () => {
      const result = dcqlCredentialSchema.safeParse({
        id: 'test',
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.claim_sets).toBeUndefined();
      }
    });

    it('returns error for invalid claim_sets', () => {
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [],
        }).success
      ).toBe(false);
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [['']],
        }).success
      ).toBe(false);
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [[]],
        }).success
      ).toBe(false);
    });

    it('returns ZodError for invalid credentials', () => {
      const result = dcqlCredentialSchema.safeParse({
        format: 'mso_mdoc',
        meta: {
          doctype_value: 'org.iso.18013.5.1.mDL',
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});
