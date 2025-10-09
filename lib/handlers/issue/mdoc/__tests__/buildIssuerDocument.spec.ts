import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { buildIssuerDocument } from '../buildIssuerDocument';
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
import { documentSchema } from '@/schemas/mdoc/Document';

describe('buildIssuerDocument', () => {
  it('should build Document structure with docType and issuerSigned', () => {
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

    const document = buildIssuerDocument({
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

    // Verify Document structure
    expect(document).toBeDefined();
    expect(document.docType).toBe('org.iso.18013.5.1.mDL');
    expect(document.issuerSigned).toBeDefined();

    // issuerSigned should be defined for further tests
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Verify issuerSigned structure
    expect(document.issuerSigned.nameSpaces).toBeInstanceOf(Map);
    expect(document.issuerSigned.issuerAuth).toBeInstanceOf(Tag);

    // Verify nameSpaces
    expect(document.issuerSigned.nameSpaces.size).toBe(1);
    const nameSpace = document.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    expect(nameSpace).toBeDefined();
    expect(nameSpace).toBeInstanceOf(Array);
    expect(nameSpace?.length).toBe(3); // given_name, family_name, birth_date

    // Each item should be a Tag24
    nameSpace?.forEach((item) => {
      expect(item).toBeInstanceOf(Tag);
      expect(item.tag).toBe(24);
    });

    // Verify issuerAuth (COSE_Sign1)
    expect(document.issuerSigned.issuerAuth.tag).toBe(18);
    expect(document.issuerSigned.issuerAuth.value).toBeInstanceOf(Array);
    expect(document.issuerSigned.issuerAuth.value).toHaveLength(4);
  });

  it('should have correct structure with both docType and issuerSigned properties', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'ALICE',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const document = buildIssuerDocument({
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
    expect(document).toHaveProperty('docType');
    expect(document).toHaveProperty('issuerSigned');
    expect(Object.keys(document)).toEqual(['docType', 'issuerSigned']);
  });

  it('should create valid issuerAuth signature that can be verified', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'BOB',
        family_name: 'SMITH',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const document = buildIssuerDocument({
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

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Extract Sign1 from issuerAuth
    const sign1 = new Sign1(
      document.issuerSigned.issuerAuth.value[0],
      document.issuerSigned.issuerAuth.value[1],
      document.issuerSigned.issuerAuth.value[2],
      document.issuerSigned.issuerAuth.value[3]
    );

    // Verify signature
    const issuerJwkPublicKey = sign1.verifyX5Chain();
    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
  });

  it('should create Document with MSO containing correct docType', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'CHARLIE',
        family_name: 'BROWN',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const document = buildIssuerDocument({
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

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Extract and decode MSO from issuerAuth payload
    const sign1 = new Sign1(
      document.issuerSigned.issuerAuth.value[0],
      document.issuerSigned.issuerAuth.value[1],
      document.issuerSigned.issuerAuth.value[2],
      document.issuerSigned.issuerAuth.value[3]
    );

    expect(sign1.payload).toBeInstanceOf(Uint8Array);
    const decodedPayload = decodeCbor(sign1.payload!);
    expect(decodedPayload).toBeInstanceOf(Tag);
    expect((decodedPayload as Tag).tag).toBe(24);

    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    // Verify MSO docType matches Document docType
    expect(validatedMSO.docType).toBe(document.docType);
    expect(validatedMSO.docType).toBe('org.iso.18013.5.1.mDL');
  });

  it('should handle multiple namespaces in Document', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'DAVE',
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

    const document = buildIssuerDocument({
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

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Verify both namespaces are present
    expect(document.issuerSigned.nameSpaces.size).toBe(2);
    expect(document.issuerSigned.nameSpaces.has('org.iso.18013.5.1')).toBe(
      true
    );
    expect(document.issuerSigned.nameSpaces.has('org.iso.18013.5.2')).toBe(
      true
    );

    const ns1 = document.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    const ns2 = document.issuerSigned.nameSpaces.get('org.iso.18013.5.2');

    expect(ns1?.length).toBe(3);
    expect(ns2?.length).toBe(1);
  });

  it('should create Document without expectedUpdate when not provided', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'EVE',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const document = buildIssuerDocument({
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

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Extract and decode MSO
    const sign1 = new Sign1(
      document.issuerSigned.issuerAuth.value[0],
      document.issuerSigned.issuerAuth.value[1],
      document.issuerSigned.issuerAuth.value[2],
      document.issuerSigned.issuerAuth.value[3]
    );

    const decodedPayload = decodeCbor(sign1.payload!);
    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    // Verify expectedUpdate is not present
    expect(validatedMSO.validityInfo.expectedUpdate).toBeUndefined();
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
    const document1 = buildIssuerDocument({
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

    if (!document1.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    expect(document1.issuerSigned.issuerAuth).toBeInstanceOf(Tag);

    // Test with single Uint8Array
    const document2 = buildIssuerDocument({
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

    if (!document2.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    expect(document2.issuerSigned.issuerAuth).toBeInstanceOf(Tag);
  });

  it('should validate against documentSchema after CBOR encode/decode', () => {
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

    const document = buildIssuerDocument({
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

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Verify document structure before encoding
    expect(document.docType).toBe('org.iso.18013.5.1.mDL');
    expect(document.issuerSigned.issuerAuth).toBeInstanceOf(Tag);
    expect(document.issuerSigned.issuerAuth.tag).toBe(18);

    // Encode to CBOR
    const encoded = encodeCbor(document);

    // Decode from CBOR
    const decoded = decodeCbor(encoded) as Map<string, unknown>;
    expect(decoded).toBeInstanceOf(Map);

    // Verify decoded structure before schema validation
    expect(decoded.has('docType')).toBe(true);
    expect(decoded.has('issuerSigned')).toBe(true);

    // Validate with schema
    const validated = documentSchema.parse(decoded);

    // validated.issuerSigned should be defined
    if (!validated.issuerSigned) {
      throw new Error('validated.issuerSigned is undefined');
    }

    // Should have same structure as original
    expect(validated.docType).toBe(document.docType);
    expect(validated.issuerSigned.nameSpaces).toBeInstanceOf(Map);
    expect(validated.issuerSigned.issuerAuth).toBeInstanceOf(Tag);
    expect(validated.issuerSigned.nameSpaces.size).toBe(
      document.issuerSigned.nameSpaces.size
    );

    // Verify nameSpaces content
    const originalNs =
      document.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    const validatedNs =
      validated.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
    expect(validatedNs).toBeDefined();
    expect(validatedNs?.length).toBe(originalNs?.length);

    // Each item should still be Tag24
    validatedNs?.forEach((item) => {
      expect(item).toBeInstanceOf(Tag);
      expect(item.tag).toBe(24);
    });

    // Verify issuerAuth signature is still valid after encode/decode
    const sign1 = new Sign1(
      validated.issuerSigned.issuerAuth.value[0],
      validated.issuerSigned.issuerAuth.value[1],
      validated.issuerSigned.issuerAuth.value[2],
      validated.issuerSigned.issuerAuth.value[3]
    );
    const issuerJwkPublicKey = sign1.verifyX5Chain();
    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
  });

  it('should handle different digest algorithms', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'HENRY',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const document = buildIssuerDocument({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-512',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Extract and verify MSO has correct digest algorithm
    const sign1 = new Sign1(
      document.issuerSigned.issuerAuth.value[0],
      document.issuerSigned.issuerAuth.value[1],
      document.issuerSigned.issuerAuth.value[2],
      document.issuerSigned.issuerAuth.value[3]
    );

    const decodedPayload = decodeCbor(sign1.payload!);
    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    expect(validatedMSO.digestAlgorithm).toBe('SHA-512');
  });

  it('should handle custom docType values', () => {
    const nameSpaceElements: NameSpaceElements = {
      'com.example.custom': {
        custom_field: 'value',
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const customDocType = 'com.example.custom.document';

    const document = buildIssuerDocument({
      docType: customDocType,
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

    // Verify custom docType is preserved
    expect(document.docType).toBe(customDocType);

    // issuerSigned should be defined
    if (!document.issuerSigned) {
      throw new Error('issuerSigned is undefined');
    }

    // Verify MSO also has the custom docType
    const sign1 = new Sign1(
      document.issuerSigned.issuerAuth.value[0],
      document.issuerSigned.issuerAuth.value[1],
      document.issuerSigned.issuerAuth.value[2],
      document.issuerSigned.issuerAuth.value[3]
    );

    const decodedPayload = decodeCbor(sign1.payload!);
    const msoBytes = (decodedPayload as Tag).value;
    const decodedMSO = decodeCbor(msoBytes as Uint8Array);
    const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

    expect(validatedMSO.docType).toBe(customDocType);
  });
});
