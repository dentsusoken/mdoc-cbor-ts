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
        claims: [
          {
            id: 'claim-1',
            path: ['org.iso.18013.5.1', 'given_name'],
          },
          {
            id: 'claim-2',
            path: ['org.iso.18013.5.1', 'family_name'],
          },
          {
            id: 'claim-3',
            path: ['org.iso.18013.5.1', 'birth_date'],
          },
        ],
        claim_sets: [['claim-1'], ['claim-2', 'claim-3']],
      });
      expect(result.claim_sets).toEqual([['claim-1'], ['claim-2', 'claim-3']]);
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
            id: 'claim-1',
            path: ['org.iso.18013.5.1', 'given_name'],
          },
          {
            id: 'claim-2',
            path: ['org.iso.18013.5.1', 'family_name'],
          },
        ],
        claim_sets: [['claim-1', 'claim-2']],
      });
      expect(result.claims).toHaveLength(2);
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

    it('rejects claim_sets when claims is absent', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claim_sets: [['claim-1']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets']);
        expect(zodError.issues[0].message).toBe(
          'claim_sets MUST NOT be present if claims is absent.'
        );
      }
    });

    it('rejects claim_sets with non-existent claim ID', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              id: 'claim-1',
              path: ['org.iso.18013.5.1', 'given_name'],
            },
          ],
          claim_sets: [['claim-1', 'non-existent-claim']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0, 1]);
        expect(zodError.issues[0].message).toBe(
          'Claim ID "non-existent-claim" referenced in claim_sets[0][1] does not exist in claims array'
        );
      }
    });

    it('rejects claim_sets with multiple non-existent claim IDs', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              id: 'claim-1',
              path: ['org.iso.18013.5.1', 'given_name'],
            },
          ],
          claim_sets: [
            ['non-existent-1'],
            ['non-existent-2', 'non-existent-3'],
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues.length).toBeGreaterThanOrEqual(3);
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Claim ID "non-existent-1" referenced in claim_sets[0][0] does not exist in claims array'
        );
        expect(zodError.issues[1].path).toEqual(['claim_sets', 1, 0]);
        expect(zodError.issues[1].message).toBe(
          'Claim ID "non-existent-2" referenced in claim_sets[1][0] does not exist in claims array'
        );
        expect(zodError.issues[2].path).toEqual(['claim_sets', 1, 1]);
        expect(zodError.issues[2].message).toBe(
          'Claim ID "non-existent-3" referenced in claim_sets[1][1] does not exist in claims array'
        );
      }
    });

    it('rejects claim_sets with multiple non-existent claim IDs in same claim set', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              id: 'claim-1',
              path: ['org.iso.18013.5.1', 'given_name'],
            },
          ],
          claim_sets: [['non-existent-1', 'non-existent-2', 'non-existent-3']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues.length).toBe(3);
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Claim ID "non-existent-1" referenced in claim_sets[0][0] does not exist in claims array'
        );
        expect(zodError.issues[1].path).toEqual(['claim_sets', 0, 1]);
        expect(zodError.issues[1].message).toBe(
          'Claim ID "non-existent-2" referenced in claim_sets[0][1] does not exist in claims array'
        );
        expect(zodError.issues[2].path).toEqual(['claim_sets', 0, 2]);
        expect(zodError.issues[2].message).toBe(
          'Claim ID "non-existent-3" referenced in claim_sets[0][2] does not exist in claims array'
        );
      }
    });

    it('rejects claim_sets when claims array has no id fields', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              path: ['org.iso.18013.5.1', 'given_name'],
            },
          ],
          claim_sets: [['claim-1']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Claim ID "claim-1" referenced in claim_sets[0][0] does not exist in claims array'
        );
      }
    });

    it('rejects with multiple issues when claims is absent and claim_sets has invalid structure', () => {
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
        // Should have exactly 2 issues: one for empty string and one for claims absent
        expect(zodError.issues.length).toBe(2);
        // Check empty string error at claim_sets[0][0]
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
        // Check claims absent error at claim_sets
        expect(zodError.issues[1].path).toEqual(['claim_sets']);
        expect(zodError.issues[1].message).toBe(
          'claim_sets MUST NOT be present if claims is absent.'
        );
      }
    });

    it('rejects with multiple issues when claims is absent and claim_sets has empty inner array', () => {
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
        // Should have exactly 2 issues: one for empty array and one for claims absent
        expect(zodError.issues.length).toBe(2);
        // Check empty array error at claim_sets[0]
        expect(zodError.issues[0].path).toEqual(['claim_sets', 0]);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
        // Check claims absent error at claim_sets
        expect(zodError.issues[1].path).toEqual(['claim_sets']);
        expect(zodError.issues[1].message).toBe(
          'claim_sets MUST NOT be present if claims is absent.'
        );
      }
    });

    it('rejects with multiple issues when claim_sets has both non-existent IDs and invalid structure', () => {
      try {
        dcqlCredentialSchema.parse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              id: 'claim-1',
              path: ['org.iso.18013.5.1', 'given_name'],
            },
          ],
          claim_sets: [['non-existent-1', 'non-existent-2'], ['']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        // Should have exactly 4 issues: empty string validation error, two for non-existent IDs, and one for empty string in superRefine
        expect(zodError.issues.length).toBe(4);
        // Check empty string validation error at claim_sets[1][0]
        expect(zodError.issues[0].path).toEqual(['claim_sets', 1, 0]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
        // Check non-existent ID issue 1 at claim_sets[0][0]
        expect(zodError.issues[1].path).toEqual(['claim_sets', 0, 0]);
        expect(zodError.issues[1].message).toBe(
          'Claim ID "non-existent-1" referenced in claim_sets[0][0] does not exist in claims array'
        );
        // Check non-existent ID issue 2 at claim_sets[0][1]
        expect(zodError.issues[2].path).toEqual(['claim_sets', 0, 1]);
        expect(zodError.issues[2].message).toBe(
          'Claim ID "non-existent-2" referenced in claim_sets[0][1] does not exist in claims array'
        );
        // Check empty string in superRefine at claim_sets[1][0]
        expect(zodError.issues[3].path).toEqual(['claim_sets', 1, 0]);
        expect(zodError.issues[3].message).toBe(
          'Claim ID "" referenced in claim_sets[1][0] does not exist in claims array'
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
        claims: [
          {
            id: 'claim-1',
            path: ['org.iso.18013.5.1', 'given_name'],
          },
        ],
        claim_sets: [['claim-1']],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.claim_sets).toEqual([['claim-1']]);
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
      expect(
        dcqlCredentialSchema.safeParse({
          id: 'test',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            {
              id: 'claim-1',
              path: ['org.iso.18013.5.1', 'given_name'],
            },
          ],
          claim_sets: [['non-existent-claim']],
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
