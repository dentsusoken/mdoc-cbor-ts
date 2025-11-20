import { describe, it, expect } from 'vitest';
import { toDeviceSignedObject } from '../toDeviceSignedObject';
import { createDeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { createDeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Tag } from 'cbor-x';

describe('toDeviceSignedObject', () => {
  it('should extract nameSpaces and deviceAuth from DeviceSigned', () => {
    const deviceNameSpaces = new Map([
      ['org.iso.18013.5.1', new Map([['given_name', 'Alice']])],
    ]);
    const nameSpaces = createTag24(deviceNameSpaces);

    const deviceAuthTuple: Tag18Content = [
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      null, // payload (detached)
      new Uint8Array(64), // signature
    ];
    const deviceSignature = createTag18(deviceAuthTuple);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);

    const deviceSigned = createDeviceSigned([
      ['nameSpaces', nameSpaces],
      ['deviceAuth', deviceAuth],
    ]);

    const result = toDeviceSignedObject(deviceSigned);

    expect(result.nameSpaces).toBeInstanceOf(Tag);
    expect(result.nameSpaces).toBe(nameSpaces);
    expect(result.nameSpaces.tag).toBe(24);
    expect(result.deviceAuth).toBeInstanceOf(Map);
    expect(result.deviceAuth).toBe(deviceAuth);
    expect(result.deviceAuth.get('deviceSignature')).toBe(deviceSignature);
  });

  it('should throw ErrorCodeError when nameSpaces is missing', () => {
    const deviceAuthTuple: Tag18Content = [
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      null,
      new Uint8Array(64),
    ];
    const deviceSignature = createTag18(deviceAuthTuple);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);

    const deviceSigned = createDeviceSigned([
      ['nameSpaces', createTag24(new Map())],
      ['deviceAuth', deviceAuth],
    ]);
    deviceSigned.delete('nameSpaces');

    try {
      toDeviceSignedObject(deviceSigned);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceNameSpacesMissing);
      expect(err.message).toBe(
        `The device name spaces are missing. - ${MdocErrorCode.DeviceNameSpacesMissing} - DeviceNameSpacesMissing`
      );
    }
  });

  it('should throw ErrorCodeError when deviceAuth is missing', () => {
    const deviceNameSpaces = new Map([
      ['org.iso.18013.5.1', new Map([['given_name', 'Alice']])],
    ]);
    const nameSpaces = createTag24(deviceNameSpaces);

    const deviceSigned = createDeviceSigned([
      ['nameSpaces', nameSpaces],
      ['deviceAuth', createDeviceAuth([['deviceSignature', createTag18([new Uint8Array(), new Map(), null, new Uint8Array()])]])],
    ]);
    deviceSigned.delete('deviceAuth');

    try {
      toDeviceSignedObject(deviceSigned);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceAuthMissing);
      expect(err.message).toBe(
        `The device authentication is missing. - ${MdocErrorCode.DeviceAuthMissing} - DeviceAuthMissing`
      );
    }
  });
});

