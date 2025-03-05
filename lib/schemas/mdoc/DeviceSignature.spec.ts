import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { deviceSignatureSchema } from './DeviceSignature';

describe('DeviceSignature', () => {
  it('should accept valid Sign1 objects', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validSignature = sign1.getContentForEncoding();

    expect(() => deviceSignatureSchema.parse(validSignature)).not.toThrow();
    const result = deviceSignatureSchema.parse(validSignature);
    if ('deviceSignature' in result) {
      expect(result).toBeInstanceOf(Sign1);
      expect(result.protectedHeaders).toEqual(sign1.protectedHeaders);
      expect(result.unprotectedHeaders).toEqual(sign1.unprotectedHeaders);
      expect(result.payload).toEqual(sign1.payload);
      expect(result.signature).toEqual(sign1.signature);
    }
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {},
      {
        protectedHeaders: new Map(),
        unprotectedHeaders: new Map(),
        payload: new Uint8Array([]),
        signature: new Uint8Array([]),
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceSignatureSchema.parse(input)).toThrow();
    });
  });
});
