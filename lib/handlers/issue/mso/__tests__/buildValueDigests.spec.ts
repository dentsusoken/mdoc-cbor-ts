import { describe, expect, it, beforeAll } from 'vitest';
import { buildValueDigests } from '../buildValueDigests';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { calculateDigest } from '@/utils/calculateDigest';
import { createTag24 } from '@/cbor/createTag24';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { Document, MDoc, parse, IssuerSignedDocument } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { Tag } from 'cbor-x';

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): ReturnType<typeof createTag24> => {
  const issuerSignedItem = createIssuerSignedItem([
    ['digestID', digestID],
    ['random', new Uint8Array(16)],
    ['elementIdentifier', elementIdentifier],
    ['elementValue', elementValue],
  ]);
  return createTag24(issuerSignedItem);
};

describe('buildValueDigests', () => {
  it('should calculate value digests for namespaces', () => {
    const tags = [
      createIssuerSignedItemTag24(1),
      createIssuerSignedItemTag24(2),
    ];
    const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', tags]]);

    const digest1 = calculateDigest('SHA-256', tags[0]);
    const digest2 = calculateDigest('SHA-256', tags[1]);

    const valueDigests = buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256',
    });

    expect(valueDigests instanceof Map).toBe(true);
    const ns = valueDigests.get('org.iso.18013.5.1');
    expect(ns instanceof Map).toBe(true);
    expect(ns?.get(1)).toEqual(digest1);
    expect(ns?.get(2)).toEqual(digest2);
  });

  it('should handle multiple namespaces', () => {
    const tags1 = [createIssuerSignedItemTag24(1)];
    const tags2 = [
      createIssuerSignedItemTag24(2),
      createIssuerSignedItemTag24(3),
    ];
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', tags1],
      ['org.iso.18013.5.2', tags2],
    ]);

    const digest1 = calculateDigest('SHA-256', tags1[0]);
    const digest2 = calculateDigest('SHA-256', tags2[0]);
    const digest3 = calculateDigest('SHA-256', tags2[1]);

    const valueDigests = buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256',
    });

    expect(valueDigests.size).toBe(2);

    const ns1 = valueDigests.get('org.iso.18013.5.1');
    expect(ns1?.get(1)).toEqual(digest1);

    const ns2 = valueDigests.get('org.iso.18013.5.2');
    expect(ns2?.get(2)).toEqual(digest2);
    expect(ns2?.get(3)).toEqual(digest3);
  });

  it('should handle empty namespaces', () => {
    const nameSpaces: IssuerNameSpaces = new Map();

    const valueDigests = buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests.size).toBe(0);
  });

  it('should handle empty tags array in namespace', () => {
    const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', []]]);

    const valueDigests = buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests.size).toBe(1);
    const ns = valueDigests.get('org.iso.18013.5.1');
    expect(ns?.size).toBe(0);
  });

  describe('auth0/mdl compatibility', () => {
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
      const digestAlgorithm: DigestAlgorithm = 'SHA-256';

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

    it('should match auth0/mdl valueDigests for multiple namespaces', async () => {
      const digestAlgorithm: DigestAlgorithm = 'SHA-256';

      // Create a document with multiple namespaces
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2023-10-24T14:55:18Z');
      const validFrom = new Date(signed);
      validFrom.setMinutes(signed.getMinutes() + 5);
      const validUntil = new Date(signed);
      validUntil.setFullYear(signed.getFullYear() + 30);

      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Smith',
          given_name: 'John',
        })
        .addIssuerNameSpace('org.iso.18013.5.2', {
          license_number: 'D1234567',
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
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
      const [doc] = parsedMDOC.documents;

      // Get auth0/mdl's valueDigests
      const mso = doc.issuerSigned.issuerAuth.decodedPayload as MSO;
      const auth0ValueDigests = mso.valueDigests;
      expect(auth0ValueDigests).toBeDefined();

      // Build IssuerNameSpaces from auth0/mdl's items
      const nameSpaces: IssuerNameSpaces = new Map();
      for (const [nameSpace, items] of Object.entries(
        doc.issuerSigned.nameSpaces || {}
      )) {
        const tags = items.map((item) => new Tag(item.dataItem.buffer, 24));
        nameSpaces.set(nameSpace, tags);
      }

      // Calculate valueDigests using our function
      const ourValueDigests = buildValueDigests({
        nameSpaces,
        digestAlgorithm,
      });

      // Compare all namespaces
      expect(ourValueDigests.size).toBe(auth0ValueDigests!.size);

      auth0ValueDigests!.forEach(
        (auth0NameSpaceDigests: Map<number, Uint8Array>, nameSpace: string) => {
          const ourNameSpaceDigests = ourValueDigests.get(nameSpace);
          expect(ourNameSpaceDigests).toBeDefined();
          expect(ourNameSpaceDigests!.size).toBe(auth0NameSpaceDigests.size);

          // Compare each digest in this namespace
          auth0NameSpaceDigests.forEach(
            (auth0Digest: Uint8Array, digestID: number) => {
              const ourDigest = ourNameSpaceDigests!.get(digestID);
              expect(ourDigest).toBeDefined();
              expect(Array.from(ourDigest!)).toEqual(Array.from(auth0Digest));
            }
          );
        }
      );
    });
  });
});
