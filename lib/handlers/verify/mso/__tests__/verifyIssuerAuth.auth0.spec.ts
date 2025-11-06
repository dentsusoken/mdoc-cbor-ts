import { describe, it, expect } from 'vitest';
import { verifyIssuerSigned } from '../verifyIssuerSigned';
import { decodeCbor } from '@/cbor/codec';
import { createTag1004 } from '@/cbor/createTag1004';
import { Document, MDoc } from '@auth0/mdl';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { mdocSchema } from '@/schemas/mdoc/Mdoc';

describe('verifyIssuerAuth auth0/mdl compatibility', () => {
  it('should verify auth0/mdl IssuerAuth with our implementation', async () => {
    const nameSpace = 'org.iso.18013.5.1';
    const digestAlgorithm = 'SHA-256';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { d: _unused, ...publicKeyJWK } = DEVICE_JWK;
    const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

    const signed = new Date('2023-10-24T14:55:18Z');
    const validFrom = new Date(signed);
    validFrom.setMinutes(signed.getMinutes() + 5);
    const validUntil = new Date(signed);
    validUntil.setFullYear(signed.getFullYear() + 30);
    const expectedUpdate = new Date(signed);
    expectedUpdate.setFullYear(signed.getFullYear() + 1);

    // Create auth0/mdl document
    const document = await new Document('org.iso.18013.5.1.mDL')
      .addIssuerNameSpace('org.iso.18013.5.1', {
        family_name: 'Jones',
        given_name: 'Ava',
        birth_date: createTag1004(new Date('2007-03-25')),
      })
      .useDigestAlgorithm(digestAlgorithm)
      .addValidityInfo({
        signed,
        validFrom,
        validUntil,
        expectedUpdate,
      })
      .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
      .sign({
        issuerPrivateKey,
        issuerCertificate: ISSUER_CERTIFICATE,
        alg: 'ES256',
      });

    const mdoc = new MDoc([document]);
    const encoded = mdoc.encode();
    const decoded = decodeCbor(encoded);
    const parsedMDoc = mdocSchema.parse(decoded);

    const [parsedDocument] = parsedMDoc.get('documents')!;

    const issuerSigned = parsedDocument.get('issuerSigned')!;
    expect(issuerSigned).toBeDefined();

    const { mso, nameSpaces } = verifyIssuerSigned({
      issuerSigned,
      now: validFrom,
      clockSkew: 60,
    });

    expect(mso.get('version')).toBe('1.0');
    expect(mso.get('valueDigests')).toBeDefined();
    expect(mso.get('validityInfo')).toBeDefined();
    expect(nameSpaces.get(nameSpace)).toBeDefined();
  });
});
