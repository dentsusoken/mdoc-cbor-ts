import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { pexInputDescriptorSchema } from '../PexInputDescriptor';

describe('pexInputDescriptorSchema', () => {
  describe('should accept valid input descriptors', () => {
    it('accepts minimal valid input descriptor', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'test-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {},
      });
      expect(result).toEqual({
        id: 'test-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {},
      });
    });

    it('accepts input descriptor with all properties', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'descriptor-1',
        format: {
          mso_mdoc: {
            alg: ['ES256', 'ES384'],
          },
        },
        constraints: {
          limit_disclosure: 'required',
          fields: [
            {
              path: ["$['org.iso.18013.5.1']['given_name']"],
              intent_to_retain: true,
            },
          ],
        },
      });
      expect(result.id).toBe('descriptor-1');
      expect(result.format.mso_mdoc.alg).toEqual(['ES256', 'ES384']);
      expect(result.constraints.limit_disclosure).toBe('required');
      expect(result.constraints.fields).toHaveLength(1);
    });

    it('accepts input descriptor with multiple algorithms', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'multi-alg-id',
        format: {
          mso_mdoc: {
            alg: ['ES256', 'ES384', 'ES512'],
          },
        },
        constraints: {
          fields: [
            {
              path: ["$['org.iso.18013.5.1']['field']"],
            },
          ],
        },
      });
      expect(result.format.mso_mdoc.alg).toEqual(['ES256', 'ES384', 'ES512']);
    });

    it('accepts input descriptor with constraints limit_disclosure preferred', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'preferred-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {
          limit_disclosure: 'preferred',
        },
      });
      expect(result.constraints.limit_disclosure).toBe('preferred');
    });

    it('accepts input descriptor with constraints limit_disclosure required', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'required-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {
          limit_disclosure: 'required',
        },
      });
      expect(result.constraints.limit_disclosure).toBe('required');
    });

    it('accepts input descriptor with multiple fields in constraints', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'multi-field-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {
          fields: [
            {
              path: ["$['org.iso.18013.5.1']['given_name']"],
              intent_to_retain: true,
            },
            {
              path: ["$['org.iso.18013.5.1']['family_name']"],
              intent_to_retain: false,
            },
          ],
        },
      });
      expect(result.constraints.fields).toHaveLength(2);
      expect(result.constraints.fields?.[0].intent_to_retain).toBe(true);
      expect(result.constraints.fields?.[1].intent_to_retain).toBe(false);
    });

    it('accepts input descriptor with fields containing filters', () => {
      const result = pexInputDescriptorSchema.parse({
        id: 'filter-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {
          fields: [
            {
              path: ["$['org.iso.18013.5.1']['age']"],
              filter: {
                type: 'number',
                const: 18,
              },
            },
          ],
        },
      });
      expect(result.constraints.fields?.[0].filter).toEqual({
        type: 'number',
        const: 18,
      });
    });
  });

  describe('should reject invalid input descriptors', () => {
    it('rejects missing id', () => {
      try {
        pexInputDescriptorSchema.parse({
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['id']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects id that is not a string (number)', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 123,
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: {},
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

    it('rejects id that is not a string (null)', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: null,
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['id']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects id that is not a string (boolean)', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: true,
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['id']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects missing format', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects format that is not an object (string)', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: 'not-an-object',
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });

    it('rejects format with missing mso_mdoc', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: {},
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format', 'mso_mdoc']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects format with invalid mso_mdoc.alg', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: {
            mso_mdoc: {
              alg: [],
            },
          },
          constraints: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['format', 'mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects missing constraints', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['constraints']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects constraints that is not an object (string)', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: 'not-an-object',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['constraints']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });

    it('rejects constraints with invalid limit_disclosure', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: {
            limit_disclosure: 'invalid',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['constraints', 'limit_disclosure']);
        expect(zodError.issues[0].message).toBe(
          "Invalid enum value. Expected 'required' | 'preferred', received 'invalid'"
        );
      }
    });

    it('rejects constraints with invalid fields (empty path array)', () => {
      try {
        pexInputDescriptorSchema.parse({
          id: 'test-id',
          format: {
            mso_mdoc: {
              alg: ['ES256'],
            },
          },
          constraints: {
            fields: [
              {
                path: [],
              },
            ],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'constraints',
          'fields',
          0,
          'path',
        ]);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects input that is not an object (string)', () => {
      try {
        pexInputDescriptorSchema.parse('not-an-object');
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });

    it('rejects input that is not an object (array)', () => {
      try {
        pexInputDescriptorSchema.parse([]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received array'
        );
      }
    });

    it('rejects input that is not an object (null)', () => {
      try {
        pexInputDescriptorSchema.parse(null);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received null'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid input descriptor', () => {
      const result = pexInputDescriptorSchema.safeParse({
        id: 'test-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {},
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test-id');
        expect(result.data.format.mso_mdoc.alg).toEqual(['ES256']);
        expect(result.data.constraints).toEqual({});
      }
    });

    it('returns success for input descriptor with all properties', () => {
      const result = pexInputDescriptorSchema.safeParse({
        id: 'descriptor-1',
        format: {
          mso_mdoc: {
            alg: ['ES256', 'ES384'],
          },
        },
        constraints: {
          limit_disclosure: 'required',
          fields: [
            {
              path: ["$['org.iso.18013.5.1']['given_name']"],
              intent_to_retain: true,
            },
          ],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.constraints.limit_disclosure).toBe('required');
        expect(result.data.constraints.fields).toHaveLength(1);
      }
    });

    it('returns error for missing id', () => {
      const result = pexInputDescriptorSchema.safeParse({
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {},
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('returns error for invalid format', () => {
      const result = pexInputDescriptorSchema.safeParse({
        id: 'test-id',
        format: {},
        constraints: {},
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['format', 'mso_mdoc']);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('returns error for invalid constraints', () => {
      const result = pexInputDescriptorSchema.safeParse({
        id: 'test-id',
        format: {
          mso_mdoc: {
            alg: ['ES256'],
          },
        },
        constraints: {
          limit_disclosure: 'invalid',
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['constraints', 'limit_disclosure']);
        expect(result.error.issues[0].message).toBe(
          "Invalid enum value. Expected 'required' | 'preferred', received 'invalid'"
        );
      }
    });

    it('returns error for non-object input', () => {
      const result = pexInputDescriptorSchema.safeParse('not-an-object');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });
  });
});

