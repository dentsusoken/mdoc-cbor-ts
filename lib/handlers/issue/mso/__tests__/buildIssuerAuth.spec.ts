import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag24 } from '@/cbor/createTag24';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { buildIssuerAuth } from '../buildIssuerAuth';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { buildProtectedHeaders } from '../../cose/buildProtectedHeaders';
import { encodeCbor } from '@/cbor/codec';
import { buildUnprotectedHeaders } from '../../cose/buildUnprotectedHeaders';

const p256 = createSignatureCurve('P-256', randomBytes);

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): Tag => {
  const issuerSignedItem = new Map<string, unknown>();
  issuerSignedItem.set('digestID', digestID);
  issuerSignedItem.set('random', new Uint8Array(16));
  issuerSignedItem.set('elementIdentifier', elementIdentifier);
  issuerSignedItem.set('elementValue', elementValue);
  return createTag24(issuerSignedItem);
};

describe('buildIssuerAuth', () => {
  it('should build IssuerAuth (COSE_Sign1) for given inputs', () => {
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', [createIssuerSignedItemTag24(38)]],
    ]);

    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const deviceJwkPublicKey = p256.toJwkPublicKey(publicKey);
    const issuerJwkPrivateKey = p256.toJwkPrivateKey(privateKey);

    const certificate = createSelfSignedCertificate({
      subjectJwkPublicKey: deviceJwkPublicKey,
      caJwkPrivateKey: issuerJwkPrivateKey,
      subject: 'Sign1 Interop',
      serialHex: '02',
    });
    const x5c = [certificateToDerBytes(certificate)];
    const protectedHeaders = encodeCbor(
      buildProtectedHeaders(issuerJwkPrivateKey)
    );
    const unprotectedHeaders = buildUnprotectedHeaders(x5c);

    const issuerAuth = buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey,
      digestAlgorithm: 'SHA-256',
      validFrom: 0,
      validUntil: 24 * 60 * 60 * 1000,
      expectedUpdate: 60 * 60 * 1000,
      protectedHeaders,
      unprotectedHeaders,
      issuerJwkPrivateKey,
    });

    expect(issuerAuth).toBeInstanceOf(Tag);
    expect(issuerAuth.tag).toBe(18);
    expect(issuerAuth.value).toBeInstanceOf(Array);
    expect(issuerAuth.value).toHaveLength(4);
    expect(issuerAuth.value[0]).toEqual(protectedHeaders);
    expect(issuerAuth.value[1]).toEqual(unprotectedHeaders);
    expect(issuerAuth.value[2]).toBeInstanceOf(Uint8Array);
    expect(issuerAuth.value[3]).toBeInstanceOf(Uint8Array);

    const result = issuerAuthSchema.parse(issuerAuth);

    expect(result).toEqual(issuerAuth);
  });
});
