import { z } from 'zod';
import { Tag } from 'cbor-x';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { buildIssuerNameSpaces } from '../buildIssuerNameSpaces';
import type { NameSpaceElementsRecord } from '@/schemas/record/NameSpaceElementsRecord';
import { createTag24, createTag1004 } from '@/cbor';
import type { RandomBytes } from 'noble-curves-extended';
import { Document, MDoc, parse } from '@auth0/mdl';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/../lib/mdl/__tests__/issuing/config';

/**
 * Tests for buildIssuerNameSpaces
 */

describe('buildIssuerNameSpaces', () => {
  const mockRandom = new Uint8Array(32);
  const mockRandomBytes: RandomBytes = (byteLength?: number) => {
    const length = byteLength ?? 32;
    return length === 32 ? mockRandom : new Uint8Array(length);
  };

  describe('valid cases', () => {
    it('should build IssuerNameSpaces with Tag(24) items for each element', () => {
      const input: NameSpaceElementsRecord = {
        'org.iso.18013.5.1': {
          given_name: 'John',
          family_name: 'Doe',
        },
        'org.iso.18013.5.2': {
          document_number: '1234567890',
        },
      };

      const result = buildIssuerNameSpaces(input, mockRandomBytes);

      const expected = new Map<string, Tag[]>([
        [
          'org.iso.18013.5.1',
          [
            createTag24({
              digestID: 0,
              elementIdentifier: 'given_name',
              elementValue: 'John',
              random: mockRandom,
            }),
            createTag24({
              digestID: 1,
              elementIdentifier: 'family_name',
              elementValue: 'Doe',
              random: mockRandom,
            }),
          ],
        ],
        [
          'org.iso.18013.5.2',
          [
            createTag24({
              digestID: 0,
              elementIdentifier: 'document_number',
              elementValue: '1234567890',
              random: mockRandom,
            }),
          ],
        ],
      ]);
      expect(result).toEqual(expected);
    });
  });

  describe('invalid cases', () => {
    it('should throw when an inner namespace has no elements', () => {
      const input = {
        'org.iso.18013.5.1': {},
      } as unknown as NameSpaceElementsRecord;

      try {
        buildIssuerNameSpaces(input, mockRandomBytes);
        expect.fail('Expected ZodError for empty inner record');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            recordEmptyMessage('NameSpaceElementsRecord.Value')
          );
        }
      }
    });

    it('should throw when there are no namespaces', () => {
      const input = {} as NameSpaceElementsRecord;
      try {
        buildIssuerNameSpaces(input, mockRandomBytes);
        expect.fail('Expected ZodError for empty outer record');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            recordEmptyMessage('NameSpaceElementsRecord')
          );
        }
      }
    });

    it('should throw for invalid input type', () => {
      try {
        buildIssuerNameSpaces(
          'not-a-record' as unknown as NameSpaceElementsRecord,
          mockRandomBytes
        );
        expect.fail('Expected parse to throw a ZodError');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            recordInvalidTypeMessage('NameSpaceElementsRecord')
          );
        }
      }
    });
  });

  describe('auth0/mdl compatibility', () => {
    it('should produce same IssuerNameSpaces structure as auth0/mdl', async () => {
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
          birth_date: createTag1004(new Date('2007-03-25')),
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

      const nameSpace = 'org.iso.18013.5.1';
      const issuerSignedItems =
        parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
      expect(issuerSignedItems).toBeDefined();

      // Create nameSpacesElements in the SAME ORDER as auth0/mdl's issuerSignedItems
      const nameSpacesElements: Record<string, Record<string, unknown>> = {
        [nameSpace]: {},
      };
      const randomBytesByOrder: Uint8Array[] = [];

      issuerSignedItems!.forEach((item) => {
        // For birth_date, issue_date, expiry_date in mDL namespace,
        // convert to Tag1004 to match our expected usage pattern
        const elementValue = item.elementValue;
        nameSpacesElements[nameSpace][item.elementIdentifier] = elementValue;
        randomBytesByOrder.push(item.random);
      });

      // Create custom randomBytes function
      let callCount = 0;
      const customRandomBytes: RandomBytes = (byteLength?: number) => {
        const length = byteLength ?? 32;
        if (length === 32 && callCount < randomBytesByOrder.length) {
          return randomBytesByOrder[callCount++];
        }
        return new Uint8Array(length);
      };

      // Build IssuerNameSpaces using our function
      const ourNameSpaces = buildIssuerNameSpaces(
        nameSpacesElements,
        customRandomBytes
      );

      // Verify structure
      expect(ourNameSpaces).toBeInstanceOf(Map);
      expect(ourNameSpaces.size).toBe(1);

      const ourTags = ourNameSpaces.get(nameSpace);
      expect(ourTags).toBeDefined();
      expect(ourTags!.length).toBe(issuerSignedItems!.length);

      // Compare each Tag24
      issuerSignedItems!.forEach((auth0Item, index) => {
        const ourTag = ourTags![index];
        expect(ourTag).toBeInstanceOf(Tag);
        expect(ourTag.tag).toBe(24);

        // Compare Tag24 byte arrays
        const auth0Bytes = auth0Item.dataItem.buffer;
        const ourBytes = ourTag.value as Uint8Array;
        expect(Array.from(ourBytes)).toEqual(Array.from(auth0Bytes));
      });
    });

    it('should match auth0/mdl IssuerNameSpaces with multiple namespaces', async () => {
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
      const [parsedDoc] = parsedMDOC.documents;

      // Build nameSpacesElements from auth0/mdl in same order
      const nameSpacesElements: Record<string, Record<string, unknown>> = {};
      const allRandomBytes: Uint8Array[] = [];

      for (const [nameSpace, items] of Object.entries(
        parsedDoc.issuerSigned.nameSpaces || {}
      )) {
        nameSpacesElements[nameSpace] = {};
        items.forEach((item) => {
          nameSpacesElements[nameSpace][item.elementIdentifier] =
            item.elementValue;
          allRandomBytes.push(item.random);
        });
      }

      // Create custom randomBytes function
      let callCount = 0;
      const customRandomBytes: RandomBytes = (byteLength?: number) => {
        const length = byteLength ?? 32;
        if (length === 32 && callCount < allRandomBytes.length) {
          return allRandomBytes[callCount++];
        }
        return new Uint8Array(length);
      };

      // Build IssuerNameSpaces using our function
      const ourNameSpaces = buildIssuerNameSpaces(
        nameSpacesElements,
        customRandomBytes
      );

      // Verify all namespaces match
      expect(ourNameSpaces.size).toBe(
        Object.keys(parsedDoc.issuerSigned.nameSpaces || {}).length
      );

      for (const [nameSpace, auth0Items] of Object.entries(
        parsedDoc.issuerSigned.nameSpaces || {}
      )) {
        const ourTags = ourNameSpaces.get(nameSpace);
        expect(ourTags).toBeDefined();
        expect(ourTags!.length).toBe(auth0Items.length);

        // Compare each Tag24
        auth0Items.forEach((auth0Item, index) => {
          const ourTag = ourTags![index];
          const auth0Bytes = auth0Item.dataItem.buffer;
          const ourBytes = ourTag.value as Uint8Array;
          expect(Array.from(ourBytes)).toEqual(Array.from(auth0Bytes));
        });
      }
    });
  });
});
