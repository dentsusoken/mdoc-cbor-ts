import { describe, expect, it, beforeAll } from 'vitest';
import { buildValueDigest } from '../buildValueDigest';
import { Document, MDoc, parse, IssuerSignedDocument } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { Tag } from 'cbor-x';

describe('buildValueDigest auth0/mdl compatibility', () => {
  let parsedDocument: IssuerSignedDocument;
  let encoded: Uint8Array;

  beforeAll(async () => {
    const { ...deviceKey } = DEVICE_JWK;
    const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

    const signed = new Date('2023-10-24T14:55:18Z');
    const validFrom = new Date(signed);
    validFrom.setMinutes(signed.getMinutes() + 5);
    const validUntil = new Date(signed);
    validUntil.setFullYear(signed.getFullYear() + 30);
    const expectedUpdate = new Date(signed);
    expectedUpdate.setFullYear(signed.getFullYear() + 1);

    const document = await new Document('org.iso.18013.5.1.mDL')
      .addIssuerNameSpace('org.iso.18013.5.1', {
        family_name: 'Jones',
        given_name: 'Ava',
        birth_date: '2007-03-25',
      })
      .useDigestAlgorithm('SHA-256')
      .addValidityInfo({
        signed,
        validFrom,
        validUntil,
        expectedUpdate,
      })
      .addDeviceKeyInfo({ deviceKey })
      .sign({
        issuerPrivateKey,
        issuerCertificate: ISSUER_CERTIFICATE,
        alg: 'ES256',
      });

    const mdoc = new MDoc([document]);
    encoded = mdoc.encode();

    const parsedMDOC = parse(encoded);
    [parsedDocument] = parsedMDOC.documents;
  });

  it('should produce same digest as auth0/mdl for all items', () => {
    const nameSpace = 'org.iso.18013.5.1';
    const digestAlgorithm = 'SHA-256';

    // Get auth0/mdl's valueDigests from MSO
    const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
    const auth0Digests = mso.valueDigests?.get(nameSpace);
    expect(auth0Digests).toBeDefined();

    // Get IssuerSignedItems from auth0/mdl's document
    const auth0Items = parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
    expect(auth0Items).toBeDefined();

    // For each IssuerSignedItem, calculate digest using buildValueDigest
    auth0Items!.forEach((auth0Item) => {
      // Use auth0/mdl's DataItem buffer directly and wrap it as Tag24
      const tag = new Tag(auth0Item.dataItem.buffer, 24);

      const result = buildValueDigest({
        issuerSignedItemTag: tag,
        digestAlgorithm,
      });

      // Get expected digest from auth0/mdl's valueDigests
      const auth0Digest = auth0Digests?.get(result.digestID);
      expect(auth0Digest).toBeDefined();

      // Verify digestID matches
      expect(result.digestID).toBe(auth0Item.digestID);

      // Compare our digest with auth0/mdl's digest
      expect(Array.from(result.digest)).toEqual(Array.from(auth0Digest!));
    });
  });
});
