import { Mac0 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { deviceMacSchema } from './DeviceMac';

describe('DeviceMac', () => {
  it('should accept valid Mac0 objects', () => {
    const mac0 = new Mac0(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validMac = mac0.getContentForEncoding();

    expect(() => deviceMacSchema.parse(validMac)).not.toThrow();
    const result = deviceMacSchema.parse(validMac);
    expect(result).toBeInstanceOf(Mac0);
    expect(result.protectedHeaders).toEqual(mac0.protectedHeaders);
    expect(result.unprotectedHeaders).toEqual(mac0.unprotectedHeaders);
    expect(result.payload).toEqual(mac0.payload);
    expect(result.tag).toEqual(mac0.tag);
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
        tag: new Uint8Array([]),
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceMacSchema.parse(input)).toThrow();
    });
  });
});
