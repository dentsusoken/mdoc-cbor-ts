import { describe, it, expect } from 'vitest';
import { buildIssuerMDoc } from '../buildIssuerMDoc';
import { buildIssuerDocument } from '../buildIssuerDocument';
import { randomBytes } from '@noble/hashes/utils';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { createTag1004 } from '@/cbor/createTag1004';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { JwkPrivateKey } from '@/jwk/types';
import { certificatePemToDerBytes } from '@/x509/certificatePemToDerBytes';
import { mdocSchema } from '@/schemas/mdoc/MDoc';
import { encodeCbor, decodeCbor } from '@/cbor/codec';

/**
 * Tests for buildIssuerMDoc
 */

describe('buildIssuerMDoc', () => {
  describe('valid cases', () => {
    it('should build an MDoc with a single document', () => {
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

      const result = buildIssuerMDoc({
        documents: [document],
      });

      expect(result).toEqual({
        version: '1.0',
        documents: [document],
        status: 0,
      });
    });

    it('should build an MDoc with multiple documents', () => {
      const nameSpaceElements1: NameSpaceElements = {
        'org.iso.18013.5.1': {
          given_name: 'ALICE',
          family_name: 'SMITH',
        },
      };

      const nameSpaceElements2: NameSpaceElements = {
        'org.iso.18013.5.2': {
          license_number: 'D1234567',
        },
      };

      const signed = new Date('2024-01-01T00:00:00Z');
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const validUntil = new Date('2024-01-02T00:00:00Z');
      const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

      const document1 = buildIssuerDocument({
        docType: 'org.iso.18013.5.1.mDL',
        nameSpaceElements: nameSpaceElements1,
        randomBytes,
        deviceJwkPublicKey: DEVICE_JWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        x5chain,
        issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
      });

      const document2 = buildIssuerDocument({
        docType: 'org.iso.18013.5.2',
        nameSpaceElements: nameSpaceElements2,
        randomBytes,
        deviceJwkPublicKey: DEVICE_JWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        x5chain,
        issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
      });

      const result = buildIssuerMDoc({
        documents: [document1, document2],
      });

      expect(result).toEqual({
        version: '1.0',
        documents: [document1, document2],
        status: 0,
      });
    });

    it('should set version to 1.0', () => {
      const nameSpaceElements: NameSpaceElements = {
        'org.iso.18013.5.1': {
          given_name: 'BOB',
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

      const result = buildIssuerMDoc({
        documents: [document],
      });

      expect(result.version).toBe('1.0');
    });

    it('should set status to 0', () => {
      const nameSpaceElements: NameSpaceElements = {
        'org.iso.18013.5.1': {
          given_name: 'CHARLIE',
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

      const result = buildIssuerMDoc({
        documents: [document],
      });

      expect(result.status).toBe(0);
    });

    it('should preserve the documents array', () => {
      const nameSpaceElements1: NameSpaceElements = {
        'org.iso.18013.5.1': {
          given_name: 'DAVE',
        },
      };

      const nameSpaceElements2: NameSpaceElements = {
        'org.iso.18013.5.2': {
          license_number: 'D9876543',
        },
      };

      const signed = new Date('2024-01-01T00:00:00Z');
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const validUntil = new Date('2024-01-02T00:00:00Z');
      const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

      const document1 = buildIssuerDocument({
        docType: 'org.iso.18013.5.1.mDL',
        nameSpaceElements: nameSpaceElements1,
        randomBytes,
        deviceJwkPublicKey: DEVICE_JWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        x5chain,
        issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
      });

      const document2 = buildIssuerDocument({
        docType: 'org.iso.18013.5.2',
        nameSpaceElements: nameSpaceElements2,
        randomBytes,
        deviceJwkPublicKey: DEVICE_JWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        x5chain,
        issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
      });

      const mockDocuments = [document1, document2];

      const result = buildIssuerMDoc({
        documents: mockDocuments,
      });

      expect(result.documents).toBe(mockDocuments);
      expect(result.documents).toHaveLength(2);
    });

    it('should validate against mdocSchema after CBOR encode/decode', () => {
      const nameSpaceElements: NameSpaceElements = {
        'org.iso.18013.5.1': {
          given_name: 'EVE',
          family_name: 'JOHNSON',
          birth_date: createTag1004(new Date('1995-06-15')),
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

      const mdoc = buildIssuerMDoc({
        documents: [document],
      });

      // Encode to CBOR
      const encoded = encodeCbor(mdoc);
      expect(encoded).toBeInstanceOf(Uint8Array);

      // Decode from CBOR
      const decoded = decodeCbor(encoded) as Map<string, unknown>;
      expect(decoded).toBeInstanceOf(Map);

      // Validate with mdocSchema
      const validated = mdocSchema.parse(decoded);

      // Verify structure
      expect(validated.version).toBe('1.0');
      expect(validated.status).toBe(0);
      expect(validated.documents).toBeDefined();
      expect(validated.documents).toHaveLength(1);

      // Verify document structure
      const validatedDoc = validated.documents![0];
      expect(validatedDoc.docType).toBe('org.iso.18013.5.1.mDL');
      expect(validatedDoc.issuerSigned).toBeDefined();

      if (validatedDoc.issuerSigned) {
        expect(validatedDoc.issuerSigned.nameSpaces).toBeInstanceOf(Map);
        expect(validatedDoc.issuerSigned.nameSpaces.size).toBe(1);
      }
    });

    it('should validate MDoc with multiple documents against mdocSchema', () => {
      const nameSpaceElements1: NameSpaceElements = {
        'org.iso.18013.5.1': {
          given_name: 'FRANK',
          family_name: 'MILLER',
        },
      };

      const nameSpaceElements2: NameSpaceElements = {
        'org.iso.18013.5.2': {
          license_number: 'L123456',
        },
      };

      const signed = new Date('2024-01-01T00:00:00Z');
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const validUntil = new Date('2024-01-02T00:00:00Z');
      const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

      const document1 = buildIssuerDocument({
        docType: 'org.iso.18013.5.1.mDL',
        nameSpaceElements: nameSpaceElements1,
        randomBytes,
        deviceJwkPublicKey: DEVICE_JWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        x5chain,
        issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
      });

      const document2 = buildIssuerDocument({
        docType: 'org.iso.18013.5.2',
        nameSpaceElements: nameSpaceElements2,
        randomBytes,
        deviceJwkPublicKey: DEVICE_JWK,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
        x5chain,
        issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
      });

      const mdoc = buildIssuerMDoc({
        documents: [document1, document2],
      });

      // Encode to CBOR
      const encoded = encodeCbor(mdoc);

      // Decode from CBOR
      const decoded = decodeCbor(encoded) as Map<string, unknown>;

      // Validate with mdocSchema
      const validated = mdocSchema.parse(decoded);

      // Verify structure
      expect(validated.version).toBe('1.0');
      expect(validated.status).toBe(0);
      expect(validated.documents).toBeDefined();
      expect(validated.documents).toHaveLength(2);

      // Verify first document
      const validatedDoc1 = validated.documents![0];
      expect(validatedDoc1.docType).toBe('org.iso.18013.5.1.mDL');

      // Verify second document
      const validatedDoc2 = validated.documents![1];
      expect(validatedDoc2.docType).toBe('org.iso.18013.5.2');
    });
  });
});
