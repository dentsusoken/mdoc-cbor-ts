import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { buildValidityInfo } from '../buildValidityInfo';
import { Document, MDoc, parse } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';

describe('buildValidityInfo auth0/mdl compatibility', () => {
  it('should produce ValidityInfo structure compatible with auth0/mdl', async () => {
    const { ...publicKeyJWK } = DEVICE_JWK;
    const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

    const signed = new Date('2023-10-24T14:55:18Z');
    const validFrom = new Date('2023-10-24T15:00:18Z'); // +5 minutes
    const validUntil = new Date('2053-10-24T14:55:18Z'); // +30 years
    const expectedUpdate = new Date('2024-10-24T14:55:18Z'); // +1 year

    const document = await new Document('org.iso.18013.5.1.mDL')
      .addIssuerNameSpace('org.iso.18013.5.1', {
        family_name: 'Jones',
        given_name: 'Ava',
      })
      .useDigestAlgorithm('SHA-256')
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

    const parsedMDOC = parse(encoded);
    const [parsedDocument] = parsedMDOC.documents;

    // Get auth0/mdl's ValidityInfo
    const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
    const auth0ValidityInfo = mso.validityInfo;

    expect(auth0ValidityInfo).toBeDefined();

    // Build our ValidityInfo using the same dates
    const ourValidityInfo = buildValidityInfo({
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
    });

    // Verify our structure uses Tag(0)
    const os = ourValidityInfo.get('signed')!;
    const ovf = ourValidityInfo.get('validFrom')!;
    const ovu = ourValidityInfo.get('validUntil')!;
    const oe = ourValidityInfo.get('expectedUpdate')!;
    expect(os).toBeInstanceOf(Tag);
    expect(os.tag).toBe(0);
    expect(ovf).toBeInstanceOf(Tag);
    expect(ovf.tag).toBe(0);
    expect(ovu).toBeInstanceOf(Tag);
    expect(ovu.tag).toBe(0);
    expect(oe).toBeInstanceOf(Tag);
    expect(oe.tag).toBe(0);

    // auth0/mdl decodes ValidityInfo as Date objects
    expect(auth0ValidityInfo.signed).toBeInstanceOf(Date);
    expect(auth0ValidityInfo.validFrom).toBeInstanceOf(Date);
    expect(auth0ValidityInfo.validUntil).toBeInstanceOf(Date);
    expect(auth0ValidityInfo.expectedUpdate).toBeInstanceOf(Date);

    expect(new Date(os.value)).toEqual(auth0ValidityInfo.signed);
    expect(new Date(ovf.value)).toEqual(auth0ValidityInfo.validFrom);
    expect(new Date(ovu.value)).toEqual(auth0ValidityInfo.validUntil);
    expect(new Date(oe.value)).toEqual(auth0ValidityInfo.expectedUpdate);
  });
});
