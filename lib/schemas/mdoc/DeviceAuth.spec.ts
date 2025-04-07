import { Mac0, Sign1 } from '@auth0/cose';
import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { deviceAuthSchema } from './DeviceAuth';

describe('DeviceAuth', () => {
  it('should accept valid device signature', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validSignature = new Map([
      ['deviceSignature', sign1.getContentForEncoding()],
    ]);

    expect(() => deviceAuthSchema.parse(validSignature)).not.toThrow();
    const result = deviceAuthSchema.parse(validSignature);
    if ('deviceSignature' in result) {
      expect(result.deviceSignature).toBeInstanceOf(Sign1);
      expect(result.deviceSignature.protectedHeaders).toEqual(
        sign1.protectedHeaders
      );
      expect(result.deviceSignature.unprotectedHeaders).toEqual(
        sign1.unprotectedHeaders
      );
      expect(result.deviceSignature.payload).toEqual(sign1.payload);
      expect(result.deviceSignature.signature).toEqual(sign1.signature);
    }
  });

  it('should accept valid device MAC', () => {
    const mac0 = new Mac0(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validMac = new Map([['deviceMac', mac0.getContentForEncoding()]]);

    expect(() => deviceAuthSchema.parse(validMac)).not.toThrow();
    const result = deviceAuthSchema.parse(validMac);
    if ('deviceMac' in result) {
      expect(result.deviceMac).toBeInstanceOf(Mac0);
      expect(result.deviceMac.protectedHeaders).toEqual(mac0.protectedHeaders);
      expect(result.deviceMac.unprotectedHeaders).toEqual(
        mac0.unprotectedHeaders
      );
      expect(result.deviceMac.payload).toEqual(mac0.payload);
      expect(result.deviceMac.tag).toEqual(mac0.tag);
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
      new Map([['deviceSignature', null]]),
      new Map([['deviceMac', null]]),
      new Map([['deviceSignature', new Tag(17, 0)]]),
      new Map([['deviceMac', new Tag(18, 0)]]),
      new Map([
        ['deviceSignature', new Tag(18, 0)],
        ['deviceMac', new Tag(19, 0)],
      ]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceAuthSchema.parse(input)).toThrow();
    });
  });
});
