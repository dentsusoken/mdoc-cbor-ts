import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { issuerAuthSchema } from './IssuerAuth';

describe('IssuerAuth', () => {
  it('should accept valid COSE_Sign1 array', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validSign1Array = sign1.getContentForEncoding();

    expect(() => issuerAuthSchema.parse(validSign1Array)).not.toThrow();
    const result = issuerAuthSchema.parse(validSign1Array);
    expect(result).toBeInstanceOf(Sign1);
    expect(result.protectedHeaders).toEqual(sign1.protectedHeaders);
    expect(result.unprotectedHeaders).toEqual(sign1.unprotectedHeaders);
    expect(result.payload).toEqual(sign1.payload);
    expect(result.signature).toEqual(sign1.signature);
  });

  it('should accept valid COSE_Sign1 array with object headers', () => {
    const array = [
      Buffer.from([]),
      {
        1: 'value',
        2: '123',
      },
      Buffer.from([]),
      Buffer.from([]),
    ];

    expect(() => issuerAuthSchema.parse(array)).not.toThrow();
    const result = issuerAuthSchema.parse(array);
    expect(result).toBeInstanceOf(Sign1);
    expect(result.unprotectedHeaders).toBeInstanceOf(Map);
    expect(result.unprotectedHeaders.get(1)).toBe('value');
    expect(result.unprotectedHeaders.get(2)).toBe('123');
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      {},
      [],
      [Buffer.from([])],
      [Buffer.from([]), Buffer.from([])],
      [Buffer.from([]), Buffer.from([]), Buffer.from([])],
      [
        Buffer.from([]),
        Buffer.from([]),
        Buffer.from([]),
        Buffer.from([]),
        Buffer.from([]),
      ],
      [Buffer.from([]), 'not-map', Buffer.from([]), Buffer.from([])],
      [
        Buffer.from([]),
        new Map([['invalid-key', 'value']]),
        Buffer.from([]),
        Buffer.from([]),
      ],
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerAuthSchema.parse(input)).toThrow();
    });
  });
});
