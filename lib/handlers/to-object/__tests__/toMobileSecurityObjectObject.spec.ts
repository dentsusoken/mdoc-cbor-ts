import { describe, it, expect } from 'vitest';
import { toMobileSecurityObjectObject } from '../toMobileSecurityObjectObject';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import { buildIssuerNameSpaces } from '@/handlers/issue/mdoc/buildIssuerNameSpaces';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { createMobileSecurityObject } from '@/schemas/mso/MobileSecurityObject';
import { createDeviceKeyInfo } from '@/schemas/mso/DeviceKeyInfo';
import { createValidityInfo } from '@/schemas/mso/ValidityInfo';
import { createTag0 } from '@/cbor/createTag0';
import { DigestAlgorithm, Key, KeyType } from '@/cose/types';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('toMobileSecurityObjectObject', () => {
  it('should convert a valid MobileSecurityObject to a plain object', () => {
    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const nameSpacesMap = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
      },
    });

    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const deviceJwkPublicKey = p256.toJwkPublicKey(publicKey);

    const nameSpaces = buildIssuerNameSpaces(nameSpacesMap, randomBytes);

    const mso = buildMobileSecurityObject({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
    });

    const result = toMobileSecurityObjectObject(mso);

    expect(result.version).toBe('1.0');
    expect(result.digestAlgorithm).toBe('SHA-256');
    expect(result.docType).toBe('org.iso.18013.5.1.mDL');
    expect(result.valueDigests).toBeInstanceOf(Map);
    expect(result.deviceKeyInfo).toBeInstanceOf(Map);
    expect(result.validityInfo).toBeInstanceOf(Map);
  });

  it('should throw ErrorCodeError when version is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    const valueDigests = new Map([
      ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
    ]);
    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validFrom', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validUntil', createTag0(new Date('2024-01-02T00:00:00Z'))],
    ]);

    const mso = createMobileSecurityObject([
      ['version', '1.0'],
      ['digestAlgorithm', DigestAlgorithm.SHA256],
      ['valueDigests', valueDigests],
      ['deviceKeyInfo', deviceKeyInfo],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]);
    mso.delete('version');

    try {
      toMobileSecurityObjectObject(mso);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.VersionMissing);
      expect(err.message).toBe(
        `Version is missing - ${MdocErrorCode.VersionMissing} - VersionMissing`
      );
    }
  });

  it('should throw ErrorCodeError when digestAlgorithm is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    const valueDigests = new Map([
      ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
    ]);
    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validFrom', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validUntil', createTag0(new Date('2024-01-02T00:00:00Z'))],
    ]);

    const mso = createMobileSecurityObject([
      ['version', '1.0'],
      ['digestAlgorithm', DigestAlgorithm.SHA256],
      ['valueDigests', valueDigests],
      ['deviceKeyInfo', deviceKeyInfo],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]);
    mso.delete('digestAlgorithm');

    try {
      toMobileSecurityObjectObject(mso);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DigestAlgorithmMissing);
      expect(err.message).toBe(
        `Digest algorithm is missing - ${MdocErrorCode.DigestAlgorithmMissing} - DigestAlgorithmMissing`
      );
    }
  });

  it('should throw ErrorCodeError when valueDigests is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    const valueDigests = new Map([
      ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
    ]);
    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validFrom', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validUntil', createTag0(new Date('2024-01-02T00:00:00Z'))],
    ]);

    const mso = createMobileSecurityObject([
      ['version', '1.0'],
      ['digestAlgorithm', DigestAlgorithm.SHA256],
      ['valueDigests', valueDigests],
      ['deviceKeyInfo', deviceKeyInfo],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]);
    mso.delete('valueDigests');

    try {
      toMobileSecurityObjectObject(mso);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.ValueDigestsMissing);
      expect(err.message).toBe(
        `Value digests are missing - ${MdocErrorCode.ValueDigestsMissing} - ValueDigestsMissing`
      );
    }
  });

  it('should throw ErrorCodeError when deviceKeyInfo is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    const valueDigests = new Map([
      ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
    ]);
    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validFrom', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validUntil', createTag0(new Date('2024-01-02T00:00:00Z'))],
    ]);

    const mso = createMobileSecurityObject([
      ['version', '1.0'],
      ['digestAlgorithm', DigestAlgorithm.SHA256],
      ['valueDigests', valueDigests],
      ['deviceKeyInfo', deviceKeyInfo],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]);
    mso.delete('deviceKeyInfo');

    try {
      toMobileSecurityObjectObject(mso);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceKeyInfoMissing);
      expect(err.message).toBe(
        `Device key info is missing - ${MdocErrorCode.DeviceKeyInfoMissing} - DeviceKeyInfoMissing`
      );
    }
  });

  it('should throw ErrorCodeError when docType is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    const valueDigests = new Map([
      ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
    ]);
    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validFrom', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validUntil', createTag0(new Date('2024-01-02T00:00:00Z'))],
    ]);

    const mso = createMobileSecurityObject([
      ['version', '1.0'],
      ['digestAlgorithm', DigestAlgorithm.SHA256],
      ['valueDigests', valueDigests],
      ['deviceKeyInfo', deviceKeyInfo],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]);
    mso.delete('docType');

    try {
      toMobileSecurityObjectObject(mso);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DocTypeMissing);
      expect(err.message).toBe(
        `Doc type is missing - ${MdocErrorCode.DocTypeMissing} - DocTypeMissing`
      );
    }
  });

  it('should throw ErrorCodeError when validityInfo is missing', () => {
    const deviceKey = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
    const deviceKeyInfo = createDeviceKeyInfo([['deviceKey', deviceKey]]);
    const valueDigests = new Map([
      ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
    ]);
    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validFrom', createTag0(new Date('2024-01-01T00:00:00Z'))],
      ['validUntil', createTag0(new Date('2024-01-02T00:00:00Z'))],
    ]);

    const mso = createMobileSecurityObject([
      ['version', '1.0'],
      ['digestAlgorithm', DigestAlgorithm.SHA256],
      ['valueDigests', valueDigests],
      ['deviceKeyInfo', deviceKeyInfo],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]);
    mso.delete('validityInfo');

    try {
      toMobileSecurityObjectObject(mso);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.ValidityInfoMissing);
      expect(err.message).toBe(
        `Validity info is missing - ${MdocErrorCode.ValidityInfoMissing} - ValidityInfoMissing`
      );
    }
  });
});
