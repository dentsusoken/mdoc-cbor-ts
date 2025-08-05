import { describe, expect, it } from 'vitest';
import { numberMapSchema } from '../NumberMap';
import { z } from 'zod';

describe('NumberMap', () => {
  it('should accept object with numeric keys and transform to Map', () => {
    const input = {
      '1': 'value1',
      '2': 'value2',
      '3': 'value3',
    };
    const result = numberMapSchema.parse(input);

    expect(result).toBeInstanceOf(Map);
    expect(result.get(1)).toBe('value1');
    expect(result.get(2)).toBe('value2');
    expect(result.get(3)).toBe('value3');
  });

  it('should accept object with mixed string/number keys', () => {
    const input = {
      '1': 'value1',
      2: 'value2',
      '3': 'value3',
    };
    const result = numberMapSchema.parse(input);

    expect(result).toBeInstanceOf(Map);
    expect(result.get(1)).toBe('value1');
    expect(result.get(2)).toBe('value2');
    expect(result.get(3)).toBe('value3');
  });

  it('should accept existing Map', () => {
    const input = new Map([
      [1, 'value1'],
      [2, 'value2'],
      [3, 'value3'],
    ]);
    const result = numberMapSchema.parse(input);

    expect(result).toBeInstanceOf(Map);
    expect(result.get(1)).toBe('value1');
    expect(result.get(2)).toBe('value2');
    expect(result.get(3)).toBe('value3');
  });

  it('should handle empty object', () => {
    const input = {};
    const result = numberMapSchema.parse(input);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('should handle empty Map', () => {
    const input = new Map();
    const result = numberMapSchema.parse(input);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('should throw NumberKey error for object with invalid string keys', () => {
    try {
      numberMapSchema.parse({ abc: 'value' });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a string containing only digits (e.g., "123")'
      );
    }
  });

  it('should throw NumberKey error for object with negative number keys', () => {
    try {
      numberMapSchema.parse({ '-1': 'value' });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a string containing only digits (e.g., "123")'
      );
    }
  });

  it('should throw NumberKey error for object with zero keys', () => {
    try {
      numberMapSchema.parse({ '0': 'value' });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer greater than 0'
      );
    }
  });

  it('should throw NumberKey error for object with decimal keys', () => {
    try {
      numberMapSchema.parse({ '1.5': 'value' });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a string containing only digits (e.g., "123")'
      );
    }
  });

  it('should throw invalid_union error for non-object/non-Map inputs', () => {
    const invalidInputs = ['string', 123, true, null, undefined, []];

    for (const input of invalidInputs) {
      try {
        numberMapSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NumberMap: Please provide a valid number map (object or Map)'
        );
      }
    }
  });
});
