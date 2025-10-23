import { describe, expect, it, beforeAll } from 'vitest';
import { buildValueDigests } from '../buildValueDigests';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { Document, MDoc, parse, IssuerSignedDocument } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { Tag } from 'cbor-x';

describe('buildValueDigests auth0/mdl compatibility', () => {
  let parsedDocument: IssuerSignedDocument;
  let encoded: Uint8Array;

  beforeAll(async () => {
    const { ...publicKeyJWK } = DEVICE_JWK;
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
      .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
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

  it('should produce same valueDigests structure as auth0/mdl', () => {
    const nameSpace = 'org.iso.18013.5.1';
    const digestAlgorithm = 'SHA-256';

    // Get auth0/mdl's valueDigests from MSO
    const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
    const auth0ValueDigests = mso.valueDigests;
    expect(auth0ValueDigests).toBeDefined();

    // Get IssuerSignedItems from auth0/mdl's document and construct IssuerNameSpaces
    const issuerSignedItems =
      parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
    expect(issuerSignedItems).toBeDefined();

    // Build IssuerNameSpaces from auth0/mdl's items
    const nameSpaces: IssuerNameSpaces = new Map();
    const tags = issuerSignedItems!.map(
      (item) => new Tag(item.dataItem.buffer, 24)
    );
    nameSpaces.set(nameSpace, tags);

    // Calculate valueDigests using our function
    const ourValueDigests = buildValueDigests({
      nameSpaces,
      digestAlgorithm,
    });

    // Compare structure
    expect(ourValueDigests.size).toBe(auth0ValueDigests!.size);

    // Compare namespace
    const ourNameSpaceDigests = ourValueDigests.get(nameSpace);
    const auth0NameSpaceDigests = auth0ValueDigests!.get(nameSpace);
    expect(ourNameSpaceDigests).toBeDefined();
    expect(auth0NameSpaceDigests).toBeDefined();
    expect(ourNameSpaceDigests!.size).toBe(auth0NameSpaceDigests!.size);

    // Compare each digest
    auth0NameSpaceDigests!.forEach(
      (auth0Digest: Uint8Array, digestID: number) => {
        const ourDigest = ourNameSpaceDigests!.get(digestID);
        expect(ourDigest).toBeDefined();
        expect(Array.from(ourDigest!)).toEqual(Array.from(auth0Digest));
      }
    );
  });
});
