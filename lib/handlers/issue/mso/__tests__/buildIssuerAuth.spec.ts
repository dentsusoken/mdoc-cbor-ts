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
  it('should build IssuerAuth (COSE_Sign1) for given inputs', async () => {
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

    const issuerAuth = await buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey,
      digestAlgorithm: 'SHA-256',
      validFrom: 0,
      validUntil: 24 * 60 * 60 * 1000,
      expectedUpdate: 60 * 60 * 1000,
      issuerJwkPrivateKey,
      x5c,
    });

    const expected = [
      expect.any(Uint8Array),
      expect.any(Map<number, unknown>),
      expect.any(Uint8Array),
      expect.any(Uint8Array),
    ];
    expect(issuerAuth).toEqual(expected);

    const result = issuerAuthSchema.parse(issuerAuth);

    expect(result).toEqual(issuerAuth);
  });
});
