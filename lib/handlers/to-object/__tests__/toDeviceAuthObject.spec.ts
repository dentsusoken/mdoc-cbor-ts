import { describe, it, expect } from 'vitest';
import { toDeviceAuthObject } from '../toDeviceAuthObject';
import { createDeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { createTag17, type Tag17Content } from '@/cbor/createTag17';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Tag } from 'cbor-x';

describe('toDeviceAuthObject', () => {
  it('should extract deviceSignature from DeviceAuth', () => {
    const deviceAuthTuple: Tag18Content = [
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      null, // payload (detached)
      new Uint8Array(64), // signature
    ];
    const deviceSignature = createTag18(deviceAuthTuple);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);

    const result = toDeviceAuthObject(deviceAuth);

    expect(result.deviceSignature).toBeInstanceOf(Tag);
    expect(result.deviceSignature).toBe(deviceSignature);
    expect(result.deviceSignature.tag).toBe(18);
    expect(result.deviceMac).toBeUndefined();
  });

  it('should throw ErrorCodeError when deviceSignature is missing', () => {
    const deviceAuth = createDeviceAuth([]);

    try {
      toDeviceAuthObject(deviceAuth);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceSignatureMissing);
      expect(err.message).toBe(
        `The device signature is missing. - ${MdocErrorCode.DeviceSignatureMissing} - DeviceSignatureMissing`
      );
    }
  });

  it('should throw ErrorCodeError when deviceMac is present', () => {
    const deviceAuthTuple: Tag18Content = [
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      null,
      new Uint8Array(64),
    ];
    const deviceSignature = createTag18(deviceAuthTuple);

    const deviceMacTuple: Tag17Content = [
      new Uint8Array([0xa1, 0x01, 0x19]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      null, // payload (detached)
      new Uint8Array(32), // tag
    ];
    const deviceMac = createTag17(deviceMacTuple);
    const deviceAuth = createDeviceAuth([
      ['deviceSignature', deviceSignature],
      ['deviceMac', deviceMac],
    ]);

    try {
      toDeviceAuthObject(deviceAuth);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceMacNotSupported);
      expect(err.message).toBe(
        `The device MAC is not supported. - ${MdocErrorCode.DeviceMacNotSupported} - DeviceMacNotSupported`
      );
    }
  });

  it('should throw ErrorCodeError when deviceMac is present without deviceSignature', () => {
    const deviceMacTuple: Tag17Content = [
      new Uint8Array([0xa1, 0x01, 0x19]),
      new Map<number, unknown>(),
      null,
      new Uint8Array(32),
    ];
    const deviceMac = createTag17(deviceMacTuple);
    const deviceAuth = createDeviceAuth([['deviceMac', deviceMac]]);

    try {
      toDeviceAuthObject(deviceAuth);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      // Should throw DeviceSignatureMissing first, not DeviceMacNotSupported
      expect(err.errorCode).toBe(MdocErrorCode.DeviceSignatureMissing);
      expect(err.message).toBe(
        `The device signature is missing. - ${MdocErrorCode.DeviceSignatureMissing} - DeviceSignatureMissing`
      );
    }
  });
});
