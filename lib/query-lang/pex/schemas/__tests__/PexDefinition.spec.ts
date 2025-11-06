import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { pexDefinitionSchema } from '../PexDefinition';

describe('pexDefinitionSchema', () => {
  describe('should accept valid presentation definitions', () => {
    it('accepts minimal valid definition with single input descriptor', () => {
      const result = pexDefinitionSchema.parse({
        id: 'definition-1',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {},
          },
        ],
      });
      expect(result).toEqual({
        id: 'definition-1',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {},
          },
        ],
      });
    });

    it('accepts definition with multiple input descriptors', () => {
      const result = pexDefinitionSchema.parse({
        id: 'definition-2',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {},
          },
          {
            id: 'descriptor-2',
            format: {
              mso_mdoc: {
                alg: ['ES384'],
              },
            },
            constraints: {
              limit_disclosure: 'preferred',
            },
          },
        ],
      });
      expect(result.id).toBe('definition-2');
      expect(result.input_descriptors).toHaveLength(2);
      expect(result.input_descriptors[0].id).toBe('descriptor-1');
      expect(result.input_descriptors[1].id).toBe('descriptor-2');
    });

    it('accepts definition with input descriptors containing all properties', () => {
      const result = pexDefinitionSchema.parse({
        id: 'definition-3',
        input_descriptors: [
          {
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
          },
        ],
      });
      expect(result.input_descriptors[0].format.mso_mdoc.alg).toEqual([
        'ES256',
        'ES384',
      ]);
      expect(result.input_descriptors[0].constraints.limit_disclosure).toBe(
        'required'
      );
      expect(result.input_descriptors[0].constraints.fields).toHaveLength(1);
    });

    it('accepts definition with multiple descriptors and different constraints', () => {
      const result = pexDefinitionSchema.parse({
        id: 'definition-4',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              limit_disclosure: 'required',
              fields: [
                {
                  path: ["$['org.iso.18013.5.1']['given_name']"],
                },
              ],
            },
          },
          {
            id: 'descriptor-2',
            format: {
              mso_mdoc: {
                alg: ['ES384', 'ES512'],
              },
            },
            constraints: {
              limit_disclosure: 'preferred',
              fields: [
                {
                  path: ["$['org.iso.18013.5.1']['family_name']"],
                  intent_to_retain: true,
                },
                {
                  path: ["$['org.iso.18013.5.1']['age']"],
                  filter: {
                    type: 'number',
                    const: 18,
                  },
                },
              ],
            },
          },
        ],
      });
      expect(result.input_descriptors).toHaveLength(2);
      expect(result.input_descriptors[0].constraints.limit_disclosure).toBe(
        'required'
      );
      expect(result.input_descriptors[1].constraints.limit_disclosure).toBe(
        'preferred'
      );
      expect(result.input_descriptors[1].constraints.fields).toHaveLength(2);
    });
  });

  describe('should reject invalid presentation definitions', () => {
    it('rejects missing id', () => {
      try {
        pexDefinitionSchema.parse({
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {},
            },
          ],
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
        pexDefinitionSchema.parse({
          id: 123,
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {},
            },
          ],
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
        pexDefinitionSchema.parse({
          id: null,
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {},
            },
          ],
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
        pexDefinitionSchema.parse({
          id: true,
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {},
            },
          ],
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

    it('rejects missing input_descriptors', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects input_descriptors that is not an array (string)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects input_descriptors that is not an array (number)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects input_descriptors that is not an array (null)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects input_descriptors that is not an array (boolean)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received boolean'
        );
      }
    });

    it('rejects empty input_descriptors array', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects input_descriptors array with invalid descriptor (missing id)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [
            {
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {},
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['input_descriptors', 0, 'id']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects input_descriptors array with invalid descriptor (missing format)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [
            {
              id: 'descriptor-1',
              constraints: {},
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'input_descriptors',
          0,
          'format',
        ]);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects input_descriptors array with invalid descriptor (missing constraints)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'input_descriptors',
          0,
          'constraints',
        ]);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects input_descriptors array with invalid descriptor (invalid format)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: [],
                },
              },
              constraints: {},
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'input_descriptors',
          0,
          'format',
          'mso_mdoc',
          'alg',
        ]);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects input_descriptors array with invalid descriptor (invalid constraints)', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {
                limit_disclosure: 'invalid',
              },
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'input_descriptors',
          0,
          'constraints',
          'limit_disclosure',
        ]);
        expect(zodError.issues[0].message).toBe(
          "Invalid enum value. Expected 'required' | 'preferred', received 'invalid'"
        );
      }
    });

    it('rejects input_descriptors array with mixed valid and invalid descriptors', () => {
      try {
        pexDefinitionSchema.parse({
          id: 'definition-1',
          input_descriptors: [
            {
              id: 'descriptor-1',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {},
            },
            {
              id: 'descriptor-2',
              format: {
                mso_mdoc: {
                  alg: ['ES256'],
                },
              },
              constraints: {
                limit_disclosure: 'invalid',
              },
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'input_descriptors',
          1,
          'constraints',
          'limit_disclosure',
        ]);
      }
    });

    it('rejects input that is not an object (string)', () => {
      try {
        pexDefinitionSchema.parse('not-an-object');
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
        pexDefinitionSchema.parse([]);
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
        pexDefinitionSchema.parse(null);
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
    it('returns success for valid definition', () => {
      const result = pexDefinitionSchema.safeParse({
        id: 'definition-1',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {},
          },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('definition-1');
        expect(result.data.input_descriptors).toHaveLength(1);
      }
    });

    it('returns success for definition with multiple descriptors', () => {
      const result = pexDefinitionSchema.safeParse({
        id: 'definition-2',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {},
          },
          {
            id: 'descriptor-2',
            format: {
              mso_mdoc: {
                alg: ['ES384'],
              },
            },
            constraints: {
              limit_disclosure: 'preferred',
            },
          },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.input_descriptors).toHaveLength(2);
      }
    });

    it('returns error for missing id', () => {
      const result = pexDefinitionSchema.safeParse({
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {},
          },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('returns error for empty input_descriptors array', () => {
      const result = pexDefinitionSchema.safeParse({
        id: 'definition-1',
        input_descriptors: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['input_descriptors']);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for invalid input descriptor', () => {
      const result = pexDefinitionSchema.safeParse({
        id: 'definition-1',
        input_descriptors: [
          {
            id: 'descriptor-1',
            format: {},
            constraints: {},
          },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'input_descriptors',
          0,
          'format',
          'mso_mdoc',
        ]);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('returns error for non-object input', () => {
      const result = pexDefinitionSchema.safeParse('not-an-object');
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
