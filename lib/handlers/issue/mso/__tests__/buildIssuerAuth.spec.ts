import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { buildIssuerAuth } from '../buildIssuerAuth';
import { buildIssuerNameSpaces } from '@/handlers/issue/mdoc/buildIssuerNameSpaces';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { randomBytes } from '@noble/hashes/utils';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { createTag1004 } from '@/cbor/createTag1004';
import { Sign1 } from '@/cose/Sign1';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { JwkPrivateKey } from '@/jwk/types';
import { certificatePemToDerBytes } from '@/x509/certificatePemToDerBytes';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';

describe('buildIssuerAuth', () => {
  it('should build IssuerAuth (COSE_Sign1) for given inputs', () => {
    const nameSpacesMap = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
        family_name: 'DOE',
        birth_date: createTag1004(new Date('1990-01-01')),
      },
    });

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z'); // +1 day
    const expectedUpdate = new Date('2024-01-01T01:00:00Z'); // +1 hour

    // Prepare certificate chain from PEM
    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const nameSpaces = buildIssuerNameSpaces(nameSpacesMap, randomBytes);

    const issuerAuth = buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    expect(issuerAuth).toBeInstanceOf(Tag);
    expect(issuerAuth.tag).toBe(18);
    expect(issuerAuth.value).toBeInstanceOf(Array);
    expect(issuerAuth.value).toHaveLength(4);
    expect(issuerAuth.value[0]).toBeInstanceOf(Uint8Array); // protected headers
    expect(issuerAuth.value[1]).toBeInstanceOf(Map); // unprotected headers
    expect(issuerAuth.value[2]).toBeInstanceOf(Uint8Array); // payload
    expect(issuerAuth.value[3]).toBeInstanceOf(Uint8Array); // signature

    const sign1 = new Sign1(
      issuerAuth.value[0],
      issuerAuth.value[1],
      issuerAuth.value[2],
      issuerAuth.value[3]
    );
    const issuerJwkPublicKey = sign1.verifyX5Chain();

    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
  });

  it('should preserve structure after CBOR encode/decode and schema validation', () => {
    const nameSpacesMap = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'ALICE',
        family_name: 'SMITH',
        birth_date: createTag1004(new Date('1985-05-15')),
      },
    });

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);
    const nameSpaces = buildIssuerNameSpaces(nameSpacesMap, randomBytes);

    const issuerAuth = buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Verify original structure
    expect(issuerAuth).toBeInstanceOf(Tag);
    expect(issuerAuth.tag).toBe(18);
    expect(issuerAuth.value).toHaveLength(4);

    // Encode to CBOR
    const encoded = encodeCbor(issuerAuth);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Decode from CBOR
    const decoded = decodeCbor(encoded);

    // Validate with schema
    const validated = issuerAuthSchema.parse(decoded);

    // Validated should also be Tag
    expect(validated).toBeInstanceOf(Tag);
    expect(validated.tag).toBe(18);
    expect(validated.value).toHaveLength(4);

    expect(validated.value[0]).toEqual(Uint8Array.from(issuerAuth.value[0]));
    expect(validated.value[1]).toEqual(issuerAuth.value[1]);
    expect(validated.value[2]).toEqual(issuerAuth.value[2]);
    expect(validated.value[3]).toEqual(issuerAuth.value[3]);
  });
});
