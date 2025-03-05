import { Mac0, Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../../cbor';
import { deviceSignedSchema } from './DeviceSigned';

describe('DeviceSigned', () => {
  it('should accept valid device signed data', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const mac0 = new Mac0(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validData = [
      {
        nameSpaces: new ByteString({}),
        deviceAuth: {
          deviceSignature: sign1.getContentForEncoding(),
        },
      },
      {
        nameSpaces: new ByteString({}),
        deviceAuth: {
          deviceMac: mac0.getContentForEncoding(),
        },
      },
    ];

    validData.forEach((data) => {
      expect(() => deviceSignedSchema.parse(data)).not.toThrow();
      const result = deviceSignedSchema.parse(data);
      expect(result.nameSpaces).toEqual(data.nameSpaces);
      if ('deviceSignature' in result.deviceAuth) {
        expect(result.deviceAuth.deviceSignature).toBeInstanceOf(Sign1);
        expect(result.deviceAuth.deviceSignature.protectedHeaders).toEqual(
          sign1.protectedHeaders
        );
      } else if ('deviceMac' in result.deviceAuth) {
        expect(result.deviceAuth.deviceMac).toBeInstanceOf(Mac0);
        expect(result.deviceAuth.deviceMac.protectedHeaders).toEqual(
          mac0.protectedHeaders
        );
      }
    });
  });

  it('should throw error for invalid input', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const mac0 = new Mac0(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {},
      {
        nameSpaces: null,
        deviceAuth: {
          deviceSignature: sign1.getContentForEncoding(),
        },
      },
      {
        nameSpaces: new ByteString({}),
        deviceAuth: null,
      },
      {
        nameSpaces: new ByteString({}),
        deviceAuth: {
          deviceSignature: null,
        },
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceSignedSchema.parse(input)).toThrow();
    });
  });
});
