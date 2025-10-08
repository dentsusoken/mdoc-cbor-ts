import { describe, expect, it } from 'vitest';
import { buildMobileSecurityObject } from '../buildMobileSecurityObject';
import { buildIssuerNameSpaces } from '../../mdoc/buildIssuerNameSpaces';
import { jwkToCosePublicKey } from '@/cose/jwkToCosePublicKey';
import { randomBytes } from '@noble/hashes/utils';
import { createSignatureCurve } from 'noble-curves-extended';
import type { RandomBytes } from 'noble-curves-extended';
import { Document, MDoc, parse } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { createTag1004 } from '@/cbor';

const p256 = createSignatureCurve('P-256', randomBytes);

// Mock random bytes for deterministic tests
const mockRandom = new Uint8Array(32);
const mockRandomBytes: RandomBytes = (byteLength?: number) => {
  const length = byteLength ?? 32;
  return length === 32 ? mockRandom : new Uint8Array(length);
};

describe('buildMobileSecurityObject', () => {
  const signed = new Date('2024-01-01T00:00:00Z');
  const validFrom = new Date('2024-01-01T00:00:00Z');
  const validUntil = new Date('2024-01-02T00:00:00Z'); // +1 day
  const expectedUpdate = new Date('2024-01-01T01:00:00Z'); // +1 hour

  it('should create a mobile security object with all required fields', () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpacesElements = {
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
      },
    };
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const deviceJwkPublicKey = p256.toJwkPublicKey(publicKey);
    const digestAlgorithm = 'SHA-256';
    const deviceKey = jwkToCosePublicKey(deviceJwkPublicKey);

    const nameSpaces = buildIssuerNameSpaces(
      nameSpacesElements,
      mockRandomBytes
    );

    const mso = buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceJwkPublicKey,
      digestAlgorithm,
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
    });

    // Verify structure
    expect(mso.version).toBe('1.0');
    expect(mso.docType).toBe(docType);
    expect(mso.digestAlgorithm).toBe('SHA-256');
    expect(mso.deviceKeyInfo.deviceKey).toEqual(deviceKey);

    // Verify validityInfo structure
    expect(mso.validityInfo.signed.tag).toBe(0);
    expect(mso.validityInfo.signed.value).toBe('2024-01-01T00:00:00Z');
    expect(mso.validityInfo.validFrom.tag).toBe(0);
    expect(mso.validityInfo.validFrom.value).toBe('2024-01-01T00:00:00Z');
    expect(mso.validityInfo.validUntil.tag).toBe(0);
    expect(mso.validityInfo.validUntil.value).toBe('2024-01-02T00:00:00Z');
    expect(mso.validityInfo.expectedUpdate?.tag).toBe(0);
    expect(mso.validityInfo.expectedUpdate?.value).toBe('2024-01-01T01:00:00Z');

    // Verify valueDigests structure
    expect(mso.valueDigests).toBeInstanceOf(Map);
    expect(mso.valueDigests.size).toBe(1);
    const nsDigests = mso.valueDigests.get('org.iso.18013.5.1');
    expect(nsDigests).toBeInstanceOf(Map);
    expect(nsDigests?.size).toBe(1);
    expect(nsDigests?.has(0)).toBe(true);
    const digest = nsDigests?.get(0);
    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest?.length).toBe(32); // SHA-256 produces 32-byte digests
  });

  it('should create a mobile security object without expectedUpdate', () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpacesElements = {
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
      },
    };
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const deviceJwkPublicKey = p256.toJwkPublicKey(publicKey);
    const deviceKey = jwkToCosePublicKey(deviceJwkPublicKey);
    const digestAlgorithm = 'SHA-256';

    const nameSpaces = buildIssuerNameSpaces(
      nameSpacesElements,
      mockRandomBytes
    );

    const mso = buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceJwkPublicKey,
      digestAlgorithm,
      signed,
      validFrom,
      validUntil,
    });

    // Verify structure
    expect(mso.version).toBe('1.0');
    expect(mso.docType).toBe(docType);
    expect(mso.digestAlgorithm).toBe('SHA-256');
    expect(mso.deviceKeyInfo.deviceKey).toEqual(deviceKey);

    // Verify validityInfo structure (without expectedUpdate)
    expect(mso.validityInfo.signed.tag).toBe(0);
    expect(mso.validityInfo.signed.value).toBe('2024-01-01T00:00:00Z');
    expect(mso.validityInfo.validFrom.tag).toBe(0);
    expect(mso.validityInfo.validFrom.value).toBe('2024-01-01T00:00:00Z');
    expect(mso.validityInfo.validUntil.tag).toBe(0);
    expect(mso.validityInfo.validUntil.value).toBe('2024-01-02T00:00:00Z');
    expect(mso.validityInfo.expectedUpdate).toBeUndefined();

    // Verify valueDigests structure
    expect(mso.valueDigests).toBeInstanceOf(Map);
    expect(mso.valueDigests.size).toBe(1);
    const nsDigests = mso.valueDigests.get('org.iso.18013.5.1');
    expect(nsDigests).toBeInstanceOf(Map);
    expect(nsDigests?.size).toBe(1);
    expect(nsDigests?.has(0)).toBe(true);
    const digest = nsDigests?.get(0);
    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest?.length).toBe(32); // SHA-256 produces 32-byte digests
  });

  describe('auth0/mdl compatibility', () => {
    it('should produce same MSO structure as auth0/mdl', async () => {
      const nameSpace = 'org.iso.18013.5.1';
      const digestAlgorithm = 'SHA-256';

      // Create auth0/mdl document
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

      // Get auth0/mdl's MSO
      const auth0MSO = parsedDocument.issuerSigned.issuerAuth
        .decodedPayload as MSO;
      expect(auth0MSO).toBeDefined();

      // Extract issuer signed items from auth0/mdl to get random values
      const issuerSignedItems =
        parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
      expect(issuerSignedItems).toBeDefined();

      // Create nameSpacesElements in the SAME ORDER as auth0/mdl's issuerSignedItems
      // This ensures digestIDs match
      const nameSpacesElements: Record<string, Record<string, unknown>> = {
        [nameSpace]: {},
      };
      const randomBytesByOrder: Uint8Array[] = [];

      issuerSignedItems!.forEach((item) => {
        nameSpacesElements[nameSpace][item.elementIdentifier] =
          item.elementValue;
        randomBytesByOrder.push(item.random);
      });

      // Create a custom randomBytes function that returns the same random values in order
      let callCount = 0;
      const customRandomBytes: RandomBytes = (byteLength?: number) => {
        const length = byteLength ?? 32;
        if (length === 32 && callCount < randomBytesByOrder.length) {
          return randomBytesByOrder[callCount++];
        }
        return new Uint8Array(length);
      };

      // Build issuer namespaces with the custom randomBytes
      const nameSpaces = buildIssuerNameSpaces(
        nameSpacesElements,
        customRandomBytes
      );

      // Build MSO using our function with the same dates
      const ourMSO = buildMobileSecurityObject({
        docType: 'org.iso.18013.5.1.mDL',
        nameSpaces,
        deviceJwkPublicKey: publicKeyJWK,
        digestAlgorithm,
        signed,
        validFrom,
        validUntil,
        expectedUpdate,
      });

      // Verify basic fields match
      expect(ourMSO.version).toBe(auth0MSO.version);
      expect(ourMSO.docType).toBe(auth0MSO.docType);
      expect(ourMSO.digestAlgorithm).toBe(auth0MSO.digestAlgorithm);

      // Verify valueDigests structure
      expect(ourMSO.valueDigests.size).toBe(auth0MSO.valueDigests!.size);

      const ourNameSpaceDigests = ourMSO.valueDigests.get(nameSpace);
      const auth0NameSpaceDigests = auth0MSO.valueDigests!.get(nameSpace);
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

      // Verify validityInfo - auth0/mdl decodes as Date objects
      expect(auth0MSO.validityInfo.signed).toBeInstanceOf(Date);
      expect(auth0MSO.validityInfo.validFrom).toBeInstanceOf(Date);
      expect(auth0MSO.validityInfo.validUntil).toBeInstanceOf(Date);
      expect(auth0MSO.validityInfo.expectedUpdate).toBeInstanceOf(Date);

      // Verify our Tag(0) values produce the same timestamps
      expect(new Date(ourMSO.validityInfo.signed.value).getTime()).toBe(
        auth0MSO.validityInfo.signed.getTime()
      );
      expect(new Date(ourMSO.validityInfo.validFrom.value).getTime()).toBe(
        auth0MSO.validityInfo.validFrom.getTime()
      );
      expect(new Date(ourMSO.validityInfo.validUntil.value).getTime()).toBe(
        auth0MSO.validityInfo.validUntil.getTime()
      );
      expect(
        // @ts-expect-error - optional property is present here
        new Date(ourMSO.validityInfo.expectedUpdate.value).getTime()
      ).toBe(auth0MSO.validityInfo.expectedUpdate?.getTime());

      // Verify deviceKeyInfo structure matches
      expect(ourMSO.deviceKeyInfo.deviceKey).toBeDefined();
    });

    it('should match auth0/mdl MSO without expectedUpdate', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2025-01-01T00:00:00Z');
      const validFrom = new Date('2025-01-01T01:00:00Z'); // +1 hour
      const validUntil = new Date('2026-01-01T00:00:00Z'); // +1 year

      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Smith',
          given_name: 'John',
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
          // No expectedUpdate
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

      // Get auth0/mdl's MSO
      const auth0MSO = doc.issuerSigned.issuerAuth.decodedPayload as MSO;

      // Extract issuer signed items from auth0/mdl
      const nameSpace = 'org.iso.18013.5.1';
      const issuerSignedItems = doc.issuerSigned.nameSpaces?.[nameSpace];
      expect(issuerSignedItems).toBeDefined();

      // Create nameSpacesElements in the SAME ORDER as auth0/mdl's issuerSignedItems
      const nameSpacesElements: Record<string, Record<string, unknown>> = {
        [nameSpace]: {},
      };
      const randomBytesByOrder: Uint8Array[] = [];

      issuerSignedItems!.forEach((item) => {
        nameSpacesElements[nameSpace][item.elementIdentifier] =
          item.elementValue;
        randomBytesByOrder.push(item.random);
      });

      // Create custom randomBytes function that returns values in order
      let callCount = 0;
      const customRandomBytes: RandomBytes = (byteLength?: number) => {
        const length = byteLength ?? 32;
        if (length === 32 && callCount < randomBytesByOrder.length) {
          return randomBytesByOrder[callCount++];
        }
        return new Uint8Array(length);
      };

      // Build issuer namespaces with the custom randomBytes
      const nameSpaces = buildIssuerNameSpaces(
        nameSpacesElements,
        customRandomBytes
      );

      // Build our MSO
      const ourMSO = buildMobileSecurityObject({
        docType: 'org.iso.18013.5.1.mDL',
        nameSpaces,
        deviceJwkPublicKey: publicKeyJWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        // No expectedUpdate
      });

      // Verify basic fields
      expect(ourMSO.version).toBe(auth0MSO.version);
      expect(ourMSO.docType).toBe(auth0MSO.docType);
      expect(ourMSO.digestAlgorithm).toBe(auth0MSO.digestAlgorithm);

      // Verify valueDigests match
      const ourNameSpaceDigests = ourMSO.valueDigests.get(nameSpace);
      const auth0NameSpaceDigests = auth0MSO.valueDigests!.get(nameSpace);
      expect(ourNameSpaceDigests!.size).toBe(auth0NameSpaceDigests!.size);

      auth0NameSpaceDigests!.forEach(
        (auth0Digest: Uint8Array, digestID: number) => {
          const ourDigest = ourNameSpaceDigests!.get(digestID);
          expect(Array.from(ourDigest!)).toEqual(Array.from(auth0Digest));
        }
      );

      // Verify validityInfo timestamps match
      expect(new Date(ourMSO.validityInfo.signed.value).getTime()).toBe(
        auth0MSO.validityInfo.signed.getTime()
      );
      expect(new Date(ourMSO.validityInfo.validFrom.value).getTime()).toBe(
        auth0MSO.validityInfo.validFrom.getTime()
      );
      expect(new Date(ourMSO.validityInfo.validUntil.value).getTime()).toBe(
        auth0MSO.validityInfo.validUntil.getTime()
      );

      // Verify expectedUpdate is undefined in both
      expect(ourMSO.validityInfo.expectedUpdate).toBeUndefined();
      expect(auth0MSO.validityInfo.expectedUpdate).toBeUndefined();
    });
  });
});
