import { describe, expect, it } from 'vitest';
import { buildMobileSecurityObject } from '../buildMobileSecurityObject';
import { buildIssuerNameSpaces } from '../../mdoc/buildIssuerNameSpaces';
import { jwkToCosePublicKey } from '@/cose/jwkToCosePublicKey';
import { randomBytes } from '@noble/hashes/utils';
import { createSignatureCurve } from 'noble-curves-extended';
import type { RandomBytes } from 'noble-curves-extended';
import { createTag0 } from '@/cbor/createTag0';
import { calculateDigest } from '@/utils/calculateDigest';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';

const p256 = createSignatureCurve('P-256', randomBytes);

// Mock random bytes for deterministic tests
const mockRandom = new Uint8Array(32);
const mockRandomBytes: RandomBytes = (byteLength?: number) => {
  const length = byteLength ?? 32;
  return length === 32 ? mockRandom : new Uint8Array(length);
};

describe('buildMobileSecurityObjectaaaaa', () => {
  const signed = new Date('2024-01-01T00:00:00Z');
  const validFrom = new Date('2024-01-01T00:00:00Z');
  const validUntil = new Date('2024-01-02T00:00:00Z'); // +1 day
  const expectedUpdate = new Date('2024-01-01T01:00:00Z'); // +1 hour

  it('should create a mobile security object with all required fields', () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpacesMap = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
      },
    });
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const deviceJwkPublicKey = p256.toJwkPublicKey(publicKey);
    const digestAlgorithm = 'SHA-256';
    const deviceKey = jwkToCosePublicKey(deviceJwkPublicKey);

    const nameSpaces = buildIssuerNameSpaces(nameSpacesMap, mockRandomBytes);

    const mso = buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceJwkPublicKey,
      digestAlgorithm,
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
    });

    // Verify structure
    expect(mso.get('version')).toBe('1.0');
    expect(mso.get('docType')).toBe(docType);
    expect(mso.get('digestAlgorithm')).toBe('SHA-256');
    expect(mso.get('deviceKeyInfo')).toBeInstanceOf(Map);
    const deviceKeyInfo = mso.get('deviceKeyInfo')!;
    expect(deviceKeyInfo.get('deviceKey')).toEqual(deviceKey);

    expect(mso.get('validityInfo')).toBeInstanceOf(Map);
    const validityInfo = mso.get('validityInfo')!;
    expect(validityInfo.get('signed')).toEqual(createTag0(signed));
    expect(validityInfo.get('validFrom')).toEqual(createTag0(validFrom));
    expect(validityInfo.get('validUntil')).toEqual(createTag0(validUntil));
    expect(validityInfo.get('expectedUpdate')).toEqual(
      createTag0(expectedUpdate)
    );

    expect(mso.get('valueDigests')).toBeInstanceOf(Map);
    const valueDigests = mso.get('valueDigests')!;
    expect(valueDigests.size).toBe(1);
    const nsDigests = valueDigests.get('org.iso.18013.5.1')!;
    expect(nsDigests).toBeInstanceOf(Map);
    expect(nsDigests.size).toBe(1);
    const digest = nsDigests.get(0)!;
    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest).toEqual(
      calculateDigest(digestAlgorithm, nameSpaces.get('org.iso.18013.5.1')?.[0])
    );
  });
});
