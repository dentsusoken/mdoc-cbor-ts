import { describe, expect, it, beforeAll } from 'vitest';
import { buildValueDigest } from '../buildValueDigest';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
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
  const issuerSignedItem: IssuerSignedItem = {
    digestID,
    random: new Uint8Array(32), // Fixed size random for consistent testing
    elementIdentifier,
    elementValue,
  };
  return createTag24(issuerSignedItem);
};

describe('buildValueDigest', () => {
  it('should return digestID and digest for an issuer signed item', () => {
    const digestID = 42;
    const tag = createIssuerSignedItemTag24(digestID, 'given_name', 'JOHN');
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';

    const result = buildValueDigest({
      issuerSignedItemTag: tag,
      digestAlgorithm,
    });

    expect(result.digestID).toBe(digestID);
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.digest.length).toBeGreaterThan(0);
  });

  it('should calculate digest matching calculateDigest result', () => {
    const tag = createIssuerSignedItemTag24(1, 'family_name', 'DOE');
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';
    const expectedDigest = calculateDigest(digestAlgorithm, tag);

    const result = buildValueDigest({
      issuerSignedItemTag: tag,
      digestAlgorithm,
    });

    expect(result.digest).toEqual(expectedDigest);
  });

  it('should work with SHA-256 algorithm', () => {
    const tag = createIssuerSignedItemTag24(10);
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';

    const result = buildValueDigest({
      issuerSignedItemTag: tag,
      digestAlgorithm,
    });

    expect(result.digestID).toBe(10);
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.digest.length).toBe(32); // SHA-256 produces 32 bytes
  });

  it('should work with SHA-384 algorithm', () => {
    const tag = createIssuerSignedItemTag24(20);
    const digestAlgorithm: DigestAlgorithm = 'SHA-384';

    const result = buildValueDigest({
      issuerSignedItemTag: tag,
      digestAlgorithm,
    });

    expect(result.digestID).toBe(20);
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.digest.length).toBe(48); // SHA-384 produces 48 bytes
  });

  it('should work with SHA-512 algorithm', () => {
    const tag = createIssuerSignedItemTag24(30);
    const digestAlgorithm: DigestAlgorithm = 'SHA-512';

    const result = buildValueDigest({
      issuerSignedItemTag: tag,
      digestAlgorithm,
    });

    expect(result.digestID).toBe(30);
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.digest.length).toBe(64); // SHA-512 produces 64 bytes
  });

  it('should handle different element identifiers', () => {
    const tag1 = createIssuerSignedItemTag24(1, 'given_name', 'Alice');
    const tag2 = createIssuerSignedItemTag24(2, 'family_name', 'Smith');
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';

    const result1 = buildValueDigest({
      issuerSignedItemTag: tag1,
      digestAlgorithm,
    });
    const result2 = buildValueDigest({
      issuerSignedItemTag: tag2,
      digestAlgorithm,
    });

    expect(result1.digestID).toBe(1);
    expect(result2.digestID).toBe(2);
    // Different tags should produce different digests
    expect(result1.digest).not.toEqual(result2.digest);
  });

  it('should handle different element values', () => {
    const tag1 = createIssuerSignedItemTag24(1, 'age', 25);
    const tag2 = createIssuerSignedItemTag24(2, 'age', 30);
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';

    const result1 = buildValueDigest({
      issuerSignedItemTag: tag1,
      digestAlgorithm,
    });
    const result2 = buildValueDigest({
      issuerSignedItemTag: tag2,
      digestAlgorithm,
    });

    expect(result1.digestID).toBe(1);
    expect(result2.digestID).toBe(2);
    // Different values should produce different digests
    expect(result1.digest).not.toEqual(result2.digest);
  });

  it('should handle complex element values', () => {
    const complexValue = {
      vehicle_category_code: 'A',
      issue_date: '2021-09-02',
      expiry_date: '2026-09-20',
    };
    const tag = createIssuerSignedItemTag24(5, 'driving_privileges', [
      complexValue,
    ]);
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';

    const result = buildValueDigest({
      issuerSignedItemTag: tag,
      digestAlgorithm,
    });

    expect(result.digestID).toBe(5);
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.digest.length).toBe(32);
  });

  it('should extract correct digestID from tag', () => {
    const digestIDs = [1, 10, 42, 100, 999];
    const digestAlgorithm: DigestAlgorithm = 'SHA-256';

    digestIDs.forEach((digestID) => {
      const tag = createIssuerSignedItemTag24(digestID);
      const result = buildValueDigest({
        issuerSignedItemTag: tag,
        digestAlgorithm,
      });

      expect(result.digestID).toBe(digestID);
    });
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

    it('should produce same digest as auth0/mdl for all items', () => {
      const nameSpace = 'org.iso.18013.5.1';
      const digestAlgorithm: DigestAlgorithm = 'SHA-256';

      // Get auth0/mdl's valueDigests from MSO
      const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
      const auth0Digests = mso.valueDigests?.get(nameSpace);
      expect(auth0Digests).toBeDefined();

      // Get IssuerSignedItems from auth0/mdl's document
      const issuerSignedItems =
        parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
      expect(issuerSignedItems).toBeDefined();

      // For each IssuerSignedItem, calculate digest using buildValueDigest
      issuerSignedItems!.forEach((auth0Item) => {
        // Use auth0/mdl's DataItem buffer directly and wrap it as Tag24
        const tag = new Tag(auth0Item.dataItem.buffer, 24);

        const result = buildValueDigest({
          issuerSignedItemTag: tag,
          digestAlgorithm,
        });

        // Get expected digest from auth0/mdl's valueDigests
        const expectedDigest = auth0Digests?.get(result.digestID);
        expect(expectedDigest).toBeDefined();

        // Verify digestID matches
        expect(result.digestID).toBe(auth0Item.digestID);

        // Compare our digest with auth0/mdl's digest
        expect(Array.from(result.digest)).toEqual(Array.from(expectedDigest!));
      });
    });

    it('should match auth0/mdl digest for specific element', () => {
      const nameSpace = 'org.iso.18013.5.1';
      const digestAlgorithm: DigestAlgorithm = 'SHA-256';

      // Get auth0/mdl's valueDigests from MSO
      const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
      const auth0Digests = mso.valueDigests?.get(nameSpace);

      // Find the IssuerSignedItem with birth_date
      const issuerSignedItems =
        parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
      const birthDateItem = issuerSignedItems?.find(
        (item) => item.elementIdentifier === 'birth_date'
      );
      expect(birthDateItem).toBeDefined();
      expect(birthDateItem!.digestID).toBeGreaterThanOrEqual(0);

      // Use auth0/mdl's DataItem buffer directly and wrap it as Tag24
      const tag = new Tag(birthDateItem!.dataItem.buffer, 24);

      // Calculate digest using buildValueDigest
      const result = buildValueDigest({
        issuerSignedItemTag: tag,
        digestAlgorithm,
      });

      // Get expected digest from auth0/mdl
      const expectedDigest = auth0Digests?.get(result.digestID);
      expect(expectedDigest).toBeDefined();

      // Verify digestID matches
      expect(result.digestID).toBe(birthDateItem!.digestID);

      // Compare our digest with auth0/mdl's digest
      expect(Array.from(result.digest)).toEqual(Array.from(expectedDigest!));
    });
  });
});
