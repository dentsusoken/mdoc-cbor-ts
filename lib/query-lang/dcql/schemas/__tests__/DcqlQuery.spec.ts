import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlQuerySchema } from '../DcqlQuery';

describe('dcqlQuerySchema', () => {
  describe('should accept valid DCQL queries', () => {
    it('accepts query with single credential', () => {
      const result = dcqlQuerySchema.parse({
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
        ],
      });
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0].id).toBe('credential-1');
      expect(result.credentials[0].format).toBe('mso_mdoc');
    });

    it('accepts query with multiple credentials', () => {
      const result = dcqlQuerySchema.parse({
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
          {
            id: 'credential-2',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.2.mDL',
            },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
              },
            ],
          },
        ],
      });
      expect(result.credentials).toHaveLength(2);
      expect(result.credentials[0].id).toBe('credential-1');
      expect(result.credentials[1].id).toBe('credential-2');
    });

    it('accepts query with credential_sets', () => {
      const result = dcqlQuerySchema.parse({
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
        ],
        credential_sets: [[0, 1], [2]],
      });
      expect(result.credentials).toHaveLength(1);
      expect(result.credential_sets).toEqual([[0, 1], [2]]);
    });

    it('accepts query with credential_sets containing single set', () => {
      const result = dcqlQuerySchema.parse({
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
        ],
        credential_sets: [[0]],
      });
      expect(result.credential_sets).toEqual([[0]]);
    });

    it('accepts query without credential_sets (optional field)', () => {
      const result = dcqlQuerySchema.parse({
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
        ],
      });
      expect(result.credentials).toHaveLength(1);
      expect(result.credential_sets).toBeUndefined();
    });
  });

  describe('should reject invalid DCQL queries', () => {
    it('rejects missing credentials', () => {
      try {
        dcqlQuerySchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credentials']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects empty credentials array', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credentials']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects credentials that are not an array', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credentials']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects credentials array with invalid credential (missing format)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'test',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credentials', 0, 'format']);
        expect(zodError.issues[0].message).toBe(
          'Invalid literal value, expected "mso_mdoc"'
        );
      }
    });

    it('rejects credentials array with invalid credential (missing meta)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'test',
              format: 'mso_mdoc',
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credentials', 0, 'meta']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects credentials array with invalid credential (invalid meta)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'test',
              format: 'mso_mdoc',
              meta: {
                doctype_value: '',
              },
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'credentials',
          0,
          'meta',
          'doctype_value',
        ]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects invalid credential_sets (empty array)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'credential-1',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
          credential_sets: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credential_sets']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects invalid credential_sets (not an array)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'credential-1',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
          credential_sets: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credential_sets']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects invalid credential_sets (negative number)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'credential-1',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
          credential_sets: [[-1]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credential_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Number must be greater than or equal to 0'
        );
      }
    });

    it('rejects invalid credential_sets (non-integer number)', () => {
      try {
        dcqlQuerySchema.parse({
          credentials: [
            {
              id: 'credential-1',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
          credential_sets: [[1.5]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['credential_sets', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected integer, received float'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid queries', () => {
      expect(
        dcqlQuerySchema.safeParse({
          credentials: [
            {
              id: 'test',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
        }).success
      ).toBe(true);
    });

    it('returns success for valid queries with credential_sets', () => {
      const result = dcqlQuerySchema.safeParse({
        credentials: [
          {
            id: 'test',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
        ],
        credential_sets: [[0, 1], [2]],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.credential_sets).toEqual([[0, 1], [2]]);
      }
    });

    it('returns success for valid queries without credential_sets', () => {
      const result = dcqlQuerySchema.safeParse({
        credentials: [
          {
            id: 'test',
            format: 'mso_mdoc',
            meta: {
              doctype_value: 'org.iso.18013.5.1.mDL',
            },
          },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.credential_sets).toBeUndefined();
      }
    });

    it('returns error for invalid queries', () => {
      expect(dcqlQuerySchema.safeParse({}).success).toBe(false);
      expect(
        dcqlQuerySchema.safeParse({
          credentials: [],
        }).success
      ).toBe(false);
      expect(
        dcqlQuerySchema.safeParse({
          credentials: 'invalid',
        }).success
      ).toBe(false);
    });

    it('returns error for invalid credential_sets', () => {
      expect(
        dcqlQuerySchema.safeParse({
          credentials: [
            {
              id: 'test',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
          credential_sets: [],
        }).success
      ).toBe(false);
      expect(
        dcqlQuerySchema.safeParse({
          credentials: [
            {
              id: 'test',
              format: 'mso_mdoc',
              meta: {
                doctype_value: 'org.iso.18013.5.1.mDL',
              },
            },
          ],
          credential_sets: [[-1]],
        }).success
      ).toBe(false);
    });

    it('returns ZodError for invalid queries', () => {
      const result = dcqlQuerySchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});
