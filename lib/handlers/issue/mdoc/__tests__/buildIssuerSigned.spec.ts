import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { buildIssuerSigned } from '../buildIssuerSigned';
import { randomBytes } from '@noble/hashes/utils';
import { createTag1004 } from '@/cbor/createTag1004';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { JwkPrivateKey } from '@/jwk/types';
import { certificatePemToDerBytes } from '@/x509/certificatePemToDerBytes';
import { issuerSignedSchema } from '@/schemas/mdoc/IssuerSigned';

describe('buildIssuerSigned', () => {
  it('should build IssuerSigned structure with nameSpaces and issuerAuth', () => {
    const nameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
        family_name: 'DOE',
        birth_date: createTag1004(new Date('1990-01-01')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');
    const expectedUpdate = new Date('2024-01-01T01:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    expect(issuerSigned).toBeDefined();
    expect(issuerSigned.get('nameSpaces')).toBeInstanceOf(Map);
    expect(issuerSigned.get('issuerAuth')).toBeInstanceOf(Tag);
  });

  it('should validate against issuerSignedSchema after CBOR encode/decode', () => {
    const nameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'GRACE',
        family_name: 'HOPPER',
        birth_date: createTag1004(new Date('1906-12-09')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    const encoded = encodeCbor(issuerSigned);
    const decoded = decodeCbor(encoded);
    expect(issuerSignedSchema.safeParse(decoded).success).toBe(true);
  });
});
