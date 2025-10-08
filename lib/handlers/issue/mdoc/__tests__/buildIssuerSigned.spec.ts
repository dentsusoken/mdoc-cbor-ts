import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { buildIssuerSigned } from '../buildIssuerSigned';
import { randomBytes } from '@noble/hashes/utils';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { createTag1004 } from '@/cbor/createTag1004';
import { Sign1 } from '@/cose/Sign1';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { JwkPrivateKey } from '@/jwk/types';
import { certificatePemToDerBytes } from '@/x509/certificatePemToDerBytes';
import { mobileSecurityObjectSchema } from '@/schemas/mso/MobileSecurityObject';
import { issuerSignedSchema } from '@/schemas/mdoc/IssuerSigned';

describe('buildIssuerSigned', () => {
  it('should build IssuerSigned structure with nameSpaces and issuerAuth', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
        family_name: 'DOE',
        birth_date: createTag1004(new Date('1990-01-01')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');
    const expectedUpdate = new Date('2024-01-01T01:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Verify issuerSigned structure
    expect(issuerSigned).toBeDefined();
    expect(issuerSigned.nameSpaces).toBeInstanceOf(Map);
    expect(issuerSigned.issuerAuth).toBeInstanceOf(Tag);

    // Verify nameSpaces
    expect(issuerSigned.nameSpaces.size).toBe(1);
    const nameSpace = issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    expect(nameSpace).toBeDefined();
    expect(nameSpace).toBeInstanceOf(Array);
    expect(nameSpace?.length).toBe(3); // given_name, family_name, birth_date

    // Each item should be a Tag24
    nameSpace?.forEach((item) => {
      expect(item).toBeInstanceOf(Tag);
      expect(item.tag).toBe(24);
    });

    // Verify issuerAuth (COSE_Sign1)
    expect(issuerSigned.issuerAuth.tag).toBe(18);
    expect(issuerSigned.issuerAuth.value).toBeInstanceOf(Array);
    expect(issuerSigned.issuerAuth.value).toHaveLength(4);
    expect(issuerSigned.issuerAuth.value[0]).toBeInstanceOf(Uint8Array); // protected headers
    expect(issuerSigned.issuerAuth.value[1]).toBeInstanceOf(Map); // unprotected headers
    expect(issuerSigned.issuerAuth.value[2]).toBeInstanceOf(Uint8Array); // payload
    expect(issuerSigned.issuerAuth.value[3]).toBeInstanceOf(Uint8Array); // signature
  });

  it('should create valid issuerAuth signature that can be verified', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'ALICE',
        family_name: 'SMITH',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Extract Sign1 from issuerAuth
    const sign1 = new Sign1(
      issuerSigned.issuerAuth.value[0],
      issuerSigned.issuerAuth.value[1],
      issuerSigned.issuerAuth.value[2],
      issuerSigned.issuerAuth.value[3]
    );

    // Verify signature
    const issuerJwkPublicKey = sign1.verifyX5Chain();
    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
  });

  it('should create issuerAuth with MSO containing correct value digests', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'BOB',
        family_name: 'JONES',
        birth_date: createTag1004(new Date('1985-05-15')),
      },
      'org.iso.18013.5.2': {
        license_number: 'D1234567',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Extract and decode MSO from issuerAuth payload
    const sign1 = new Sign1(
      issuerSigned.issuerAuth.value[0],
      issuerSigned.issuerAuth.value[1],
      issuerSigned.issuerAuth.value[2],
      issuerSigned.issuerAuth.value[3]
    );

    expect(sign1.payload).toBeInstanceOf(Uint8Array);
    const decodedPayload = decodeCbor(sign1.payload!);
    expect(decodedPayload).toBeInstanceOf(Tag);
    expect((decodedPayload as Tag).tag).toBe(24);

    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    // Verify MSO structure
    expect(validatedMSO.version).toBe('1.0');
    expect(validatedMSO.docType).toBe('org.iso.18013.5.1.mDL');
    expect(validatedMSO.digestAlgorithm).toBe('SHA-256');

    // Verify valueDigests has both namespaces
    expect(validatedMSO.valueDigests).toBeInstanceOf(Map);
    expect(validatedMSO.valueDigests.size).toBe(2);

    const ns1Digests = validatedMSO.valueDigests.get('org.iso.18013.5.1');
    expect(ns1Digests).toBeInstanceOf(Map);
    expect(ns1Digests?.size).toBe(3); // given_name, family_name, birth_date

    const ns2Digests = validatedMSO.valueDigests.get('org.iso.18013.5.2');
    expect(ns2Digests).toBeInstanceOf(Map);
    expect(ns2Digests?.size).toBe(1); // license_number
  });

  it('should have correct structure with both nameSpaces and issuerAuth properties', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'CHARLIE',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Should have both required properties
    expect(issuerSigned).toHaveProperty('nameSpaces');
    expect(issuerSigned).toHaveProperty('issuerAuth');
    expect(Object.keys(issuerSigned)).toEqual(['nameSpaces', 'issuerAuth']);
  });

  it('should create issuerAuth without expectedUpdate when not provided', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'DAVE',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      // No expectedUpdate
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Extract and decode MSO
    const sign1 = new Sign1(
      issuerSigned.issuerAuth.value[0],
      issuerSigned.issuerAuth.value[1],
      issuerSigned.issuerAuth.value[2],
      issuerSigned.issuerAuth.value[3]
    );

    const decodedPayload = decodeCbor(sign1.payload!);
    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    // Verify expectedUpdate is not present
    expect(validatedMSO.validityInfo.expectedUpdate).toBeUndefined();
    expect(validatedMSO.validityInfo.signed).toBeDefined();
    expect(validatedMSO.validityInfo.validFrom).toBeDefined();
    expect(validatedMSO.validityInfo.validUntil).toBeDefined();
  });

  it('should handle multiple elements in single namespace', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'EVE',
        family_name: 'WILLIAMS',
        birth_date: createTag1004(new Date('1992-08-20')),
        issue_date: createTag1004(new Date('2024-01-01')),
        expiry_date: createTag1004(new Date('2034-01-01')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Verify all elements are in nameSpaces
    const nameSpace = issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    expect(nameSpace?.length).toBe(5);

    // Extract and verify MSO has correct number of digests
    const sign1 = new Sign1(
      issuerSigned.issuerAuth.value[0],
      issuerSigned.issuerAuth.value[1],
      issuerSigned.issuerAuth.value[2],
      issuerSigned.issuerAuth.value[3]
    );

    const decodedPayload = decodeCbor(sign1.payload!);
    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    const nsDigests = validatedMSO.valueDigests.get('org.iso.18013.5.1');
    expect(nsDigests?.size).toBe(5);
  });

  it('should accept x5chain as single Uint8Array or array', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'FRANK',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chainArray = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    // Test with array
    const issuerSigned1 = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain: x5chainArray,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    expect(issuerSigned1.issuerAuth).toBeInstanceOf(Tag);

    // Test with single Uint8Array
    const issuerSigned2 = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain: x5chainArray[0],
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    expect(issuerSigned2.issuerAuth).toBeInstanceOf(Tag);
  });

  it('should validate against issuerSignedSchema after CBOR encode/decode', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'GRACE',
        family_name: 'HOPPER',
        birth_date: createTag1004(new Date('1906-12-09')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const issuerSigned = buildIssuerSigned({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Verify issuerAuth structure before encoding
    expect(issuerSigned.issuerAuth).toBeInstanceOf(Tag);
    expect(issuerSigned.issuerAuth.tag).toBe(18);
    expect(issuerSigned.issuerAuth.value).toBeInstanceOf(Array);
    expect(issuerSigned.issuerAuth.value).toHaveLength(4);

    // Encode to CBOR
    const encoded = encodeCbor(issuerSigned);

    // Decode from CBOR
    const decoded = decodeCbor(encoded) as Map<string, unknown>;
    expect(decoded).toBeInstanceOf(Map);

    // Verify decoded structure before schema validation
    expect(decoded.has('nameSpaces')).toBe(true);
    expect(decoded.has('issuerAuth')).toBe(true);

    // Decode should preserve Map for nameSpaces
    const decodedNameSpaces = decoded.get('nameSpaces');
    expect(decodedNameSpaces).toBeInstanceOf(Map);

    // Decode should return issuerAuth (either as Tag or Sign1 instance from @auth0/cose)
    const decodedIssuerAuth = decoded.get('issuerAuth');
    expect(decodedIssuerAuth).toBeDefined();

    // Note: @auth0/cose automatically converts CBOR Tag 18 to Sign1 instances via addExtension.
    // Our schema handles both cases via getContentForEncoding() support.

    // Validate with schema - schema should accept Tag18, Sign1Tuple, or Sign1 instance
    const validated = issuerSignedSchema.parse(decoded);

    // Should have same structure as original
    expect(validated.nameSpaces).toBeInstanceOf(Map);
    expect(validated.issuerAuth).toBeInstanceOf(Tag);
    expect(validated.nameSpaces.size).toBe(issuerSigned.nameSpaces.size);
    expect(validated.issuerAuth.tag).toBe(issuerSigned.issuerAuth.tag);

    // Verify nameSpaces content
    const originalNs = issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    const validatedNs = validated.nameSpaces.get('org.iso.18013.5.1');
    expect(validatedNs).toBeDefined();
    expect(validatedNs?.length).toBe(originalNs?.length);

    // Each item should still be Tag24
    validatedNs?.forEach((item) => {
      expect(item).toBeInstanceOf(Tag);
      expect(item.tag).toBe(24);
    });

    // Verify issuerAuth signature is still valid after encode/decode
    const sign1 = new Sign1(
      validated.issuerAuth.value[0],
      validated.issuerAuth.value[1],
      validated.issuerAuth.value[2],
      validated.issuerAuth.value[3]
    );
    const issuerJwkPublicKey = sign1.verifyX5Chain();
    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
  });
});
