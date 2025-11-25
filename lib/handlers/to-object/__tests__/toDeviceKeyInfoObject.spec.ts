import { describe, it, expect } from 'vitest';
import { toDeviceKeyInfoObject } from '../toDeviceKeyInfoObject';
import { createDeviceKeyInfo } from '@/schemas/mso/DeviceKeyInfo';
import { createKeyAuthorizations } from '@/schemas/mso/KeyAuthorizations';
import { keyInfoSchema } from '@/schemas/mso/KeyInfo';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Key, KeyType } from '@/cose/types';

describe('toDeviceKeyInfoObject', () => {
  it('should extract deviceKey from DeviceKeyInfo', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);

    const result = toDeviceKeyInfoObject(deviceKeyInfo);

    expect(result.deviceKey).toBe(deviceKey);
    expect(result.keyAuthorizations).toBeUndefined();
    expect(result.keyInfo).toBeUndefined();
  });

  it('should extract deviceKey and keyAuthorizations from DeviceKeyInfo', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const keyAuthorizations = createKeyAuthorizations([
      ['nameSpaces', ['org.iso.18013.5.1']],
    ]);
    const deviceKeyInfo = createDeviceKeyInfo([
      ['deviceKey', deviceKey],
      ['keyAuthorizations', keyAuthorizations],
    ]);

    const result = toDeviceKeyInfoObject(deviceKeyInfo);

    expect(result.deviceKey).toBe(deviceKey);
    expect(result.keyAuthorizations).toBe(keyAuthorizations);
    expect(result.keyInfo).toBeUndefined();
  });

  it('should extract deviceKey and keyInfo from DeviceKeyInfo', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const keyInfo = keyInfoSchema.parse(
      new Map<number | string, unknown>([
        [1, 'value1'],
        ['customLabel', true],
      ])
    );
    const deviceKeyInfo = createDeviceKeyInfo([
      ['deviceKey', deviceKey],
      ['keyInfo', keyInfo],
    ]);

    const result = toDeviceKeyInfoObject(deviceKeyInfo);

    expect(result.deviceKey).toBe(deviceKey);
    expect(result.keyAuthorizations).toBeUndefined();
    expect(result.keyInfo).toBe(keyInfo);
  });

  it('should extract all fields from DeviceKeyInfo', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const keyAuthorizations = createKeyAuthorizations([
      ['nameSpaces', ['org.iso.18013.5.1']],
    ]);
    const keyInfo = keyInfoSchema.parse(
      new Map<number | string, unknown>([
        [1, 'value1'],
        ['customLabel', true],
      ])
    );
    const deviceKeyInfo = createDeviceKeyInfo([
      ['deviceKey', deviceKey],
      ['keyAuthorizations', keyAuthorizations],
      ['keyInfo', keyInfo],
    ]);

    const result = toDeviceKeyInfoObject(deviceKeyInfo);

    expect(result.deviceKey).toBe(deviceKey);
    expect(result.keyAuthorizations).toBe(keyAuthorizations);
    expect(result.keyInfo).toBe(keyInfo);
  });

  it('should throw ErrorCodeError when deviceKey is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    deviceKeyInfo.delete('deviceKey');

    try {
      toDeviceKeyInfoObject(deviceKeyInfo);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceKeyMissing);
      expect(err.message).toBe(
        `Device key is missing - ${MdocErrorCode.DeviceKeyMissing} - DeviceKeyMissing`
      );
    }
  });
});
