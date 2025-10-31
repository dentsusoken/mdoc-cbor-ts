import { describe, it, expect } from 'vitest';
import { encodeCbor } from '@/cbor/codec';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import { verifyMobileSecurityObject } from '../verifyMobileSecurityObject';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { Tag } from 'cbor-x';

const p256 = createSignatureCurve('P-256', randomBytes);

// Helper to build a minimal IssuerNameSpaces with one issuer-signed item
const buildNameSpaces = (): IssuerNameSpaces => {
  const item = createIssuerSignedItem([
    ['digestID', 1],
    ['random', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])],
    ['elementIdentifier', 'given_name'],
    ['elementValue', 'Alice'],
  ]);
  const tag = createTag24(item);
  const map: Map<string, Tag[]> = new Map([['org.iso.18013.5.1', [tag]]]);
  return map;
};

describe('verifyMobileSecurityObject', () => {
  it('decodes and validates a valid MSO payload', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const nameSpaces = buildNameSpaces();

    // Build validity info dates
    const signed = new Date();
    const validFrom = new Date(signed.getTime());
    const validUntil = new Date(signed.getTime() + 24 * 60 * 60 * 1000);

    // Build MSO using library helpers (includes valueDigests calculation)
    const mso = buildMobileSecurityObject({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey: jwkPublicKey,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
    });

    const payload = encodeCbor(createTag24(mso));

    const parsed = verifyMobileSecurityObject(payload);

    expect(parsed.get('docType')).toBe('org.iso.18013.5.1.mDL');
    expect(parsed.get('digestAlgorithm')).toBe('SHA-256');
    expect(parsed.get('validityInfo')).toBeDefined();
    expect(parsed.get('valueDigests')).toBeDefined();
  });
});
