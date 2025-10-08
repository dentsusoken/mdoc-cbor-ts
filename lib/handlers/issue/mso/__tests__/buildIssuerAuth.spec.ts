import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { buildIssuerAuth } from '../buildIssuerAuth';
import { buildIssuerNameSpaces } from '../../mdoc/buildIssuerNameSpaces';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { randomBytes } from '@noble/hashes/utils';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { createTag1004 } from '@/cbor/createTag1004';
import { Sign1 } from '@/cose/Sign1';
import { Document, MDoc, parse } from '@auth0/mdl';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { mobileSecurityObjectSchema } from '@/schemas/mso/MobileSecurityObject';
import { JwkPrivateKey } from '@/jwk/types';
import { certificatePemToDerBytes } from '@/x509/certificatePemToDerBytes';

describe('buildIssuerAuth', () => {
  it('should build IssuerAuth (COSE_Sign1) for given inputs', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
        family_name: 'DOE',
        birth_date: createTag1004(new Date('1990-01-01')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z'); // +1 day
    const expectedUpdate = new Date('2024-01-01T01:00:00Z'); // +1 hour

    // Prepare certificate chain from PEM
    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);

    const nameSpaces = buildIssuerNameSpaces(nameSpaceElements, randomBytes);

    const issuerAuth = buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    expect(issuerAuth).toBeInstanceOf(Tag);
    expect(issuerAuth.tag).toBe(18);
    expect(issuerAuth.value).toBeInstanceOf(Array);
    expect(issuerAuth.value).toHaveLength(4);
    expect(issuerAuth.value[0]).toBeInstanceOf(Uint8Array); // protected headers
    expect(issuerAuth.value[1]).toBeInstanceOf(Map); // unprotected headers
    expect(issuerAuth.value[2]).toBeInstanceOf(Uint8Array); // payload
    expect(issuerAuth.value[3]).toBeInstanceOf(Uint8Array); // signature

    const sign1 = new Sign1(
      issuerAuth.value[0],
      issuerAuth.value[1],
      issuerAuth.value[2],
      issuerAuth.value[3]
    );
    const issuerJwkPublicKey = sign1.verifyX5Chain();

    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
  });

  it('should preserve structure after CBOR encode/decode and schema validation', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'ALICE',
        family_name: 'SMITH',
        birth_date: createTag1004(new Date('1985-05-15')),
      },
    };

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z');

    const x5chain = certificatePemToDerBytes(ISSUER_CERTIFICATE);
    const nameSpaces = buildIssuerNameSpaces(nameSpaceElements, randomBytes);

    const issuerAuth = buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      deviceJwkPublicKey: DEVICE_JWK,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      x5chain,
      issuerJwkPrivateKey: ISSUER_PRIVATE_KEY_JWK as JwkPrivateKey,
    });

    // Verify original structure
    expect(issuerAuth).toBeInstanceOf(Tag);
    expect(issuerAuth.tag).toBe(18);
    expect(issuerAuth.value).toHaveLength(4);

    // Encode to CBOR
    const encoded = encodeCbor(issuerAuth);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Decode from CBOR
    const decoded = decodeCbor(encoded);

    // Validate with schema
    const validated = issuerAuthSchema.parse(decoded);

    // Validated should also be Tag
    expect(validated).toBeInstanceOf(Tag);
    expect(validated.tag).toBe(18);
    expect(validated.value).toHaveLength(4);

    // Structure should match original
    expect(validated).toEqual(issuerAuth);
  });

  describe('auth0/mdl compatibility', () => {
    it('should verify auth0/mdl IssuerAuth with Sign1 and decode MSO from Tag24 payload', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2023-10-24T14:55:18Z');
      const validFrom = new Date(signed);
      validFrom.setMinutes(signed.getMinutes() + 5);
      const validUntil = new Date(signed);
      validUntil.setFullYear(signed.getFullYear() + 30);
      const expectedUpdate = new Date(signed);
      expectedUpdate.setFullYear(signed.getFullYear() + 1);

      // Create auth0/mdl document
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

      // Get auth0/mdl's IssuerAuth (COSE_Sign1)
      const auth0IssuerAuth = parsedDocument.issuerSigned.issuerAuth;
      expect(auth0IssuerAuth).toBeDefined();
      expect(auth0IssuerAuth.payload).toBeInstanceOf(Uint8Array);

      // auth0/mdl decodes protectedHeaders to Map, we need to encode it back to bytes
      const protectedHeadersBytes = encodeCbor(
        auth0IssuerAuth.protectedHeaders
      );

      // Create our Sign1 instance from auth0's IssuerAuth components
      const sign1 = new Sign1(
        protectedHeadersBytes,
        auth0IssuerAuth.unprotectedHeaders,
        auth0IssuerAuth.payload,
        auth0IssuerAuth.signature
      );

      const issuerPublicKey = sign1.verifyX5Chain();

      // Verify auth0's IssuerAuth with our Sign1.verify()
      expect(() => sign1.verify(issuerPublicKey)).not.toThrow();

      // Verify payload is Tag24 and decode to MSO
      expect(sign1.payload).toBeInstanceOf(Uint8Array);
      const decodedPayload = decodeCbor(sign1.payload!);
      expect(decodedPayload).toBeInstanceOf(Tag);
      expect((decodedPayload as Tag).tag).toBe(24);

      // Decode the Tag24 value to get MSO
      const msoBytes = (decodedPayload as Tag).value;
      expect(msoBytes).toBeInstanceOf(Uint8Array);
      const decodedMSO = decodeCbor(msoBytes as Uint8Array);

      // Validate MSO structure with our schema
      const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);
      expect(validatedMSO).toBeDefined();

      // Verify MSO contents
      expect(validatedMSO.version).toBe('1.0');
      expect(validatedMSO.docType).toBe('org.iso.18013.5.1.mDL');
      expect(validatedMSO.digestAlgorithm).toBe('SHA-256');

      // Verify valueDigests structure
      expect(validatedMSO.valueDigests).toBeInstanceOf(Map);
      expect(validatedMSO.valueDigests.size).toBe(1);
      const nsDigests = validatedMSO.valueDigests.get('org.iso.18013.5.1');
      expect(nsDigests).toBeInstanceOf(Map);
      expect(nsDigests?.size).toBe(3); // family_name, given_name, birth_date

      // Verify validityInfo structure
      expect(validatedMSO.validityInfo.signed.tag).toBe(0);
      expect(validatedMSO.validityInfo.validFrom.tag).toBe(0);
      expect(validatedMSO.validityInfo.validUntil.tag).toBe(0);
      expect(validatedMSO.validityInfo.expectedUpdate?.tag).toBe(0);

      // Verify deviceKeyInfo
      expect(validatedMSO.deviceKeyInfo.deviceKey).toBeDefined();
    });

    it('should verify auth0/mdl IssuerAuth without expectedUpdate', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2025-01-01T00:00:00Z');
      const validFrom = new Date('2025-01-01T01:00:00Z');
      const validUntil = new Date('2026-01-01T00:00:00Z');

      // Create auth0/mdl document without expectedUpdate
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
      const [parsedDocument] = parsedMDOC.documents;

      // Get auth0/mdl's IssuerAuth
      const auth0IssuerAuth = parsedDocument.issuerSigned.issuerAuth;
      expect(auth0IssuerAuth.payload).toBeInstanceOf(Uint8Array);

      // auth0/mdl decodes protectedHeaders to Map, we need to encode it back to bytes
      const protectedHeadersBytes = encodeCbor(
        auth0IssuerAuth.protectedHeaders
      );

      // Create Sign1 instance from auth0's IssuerAuth components
      const sign1 = new Sign1(
        protectedHeadersBytes,
        auth0IssuerAuth.unprotectedHeaders,
        auth0IssuerAuth.payload,
        auth0IssuerAuth.signature
      );

      // Extract issuer public key from issuer private key (remove 'd')
      const issuerPublicKey = {
        kty: 'EC' as const,
        kid: '1234',
        x: 'iTwtg0eQbcbNabf2Nq9L_VM_lhhPCq2s0Qgw2kRx29s',
        y: 'YKwXDRz8U0-uLZ3NSI93R_35eNkl6jHp6Qg8OCup7VM',
        crv: 'P-256' as const,
      };

      // Verify signature
      expect(() => sign1.verify(issuerPublicKey)).not.toThrow();

      // Decode payload Tag24 -> MSO
      const decodedPayload = decodeCbor(sign1.payload!);
      expect((decodedPayload as Tag).tag).toBe(24);

      const msoBytes = (decodedPayload as Tag).value;
      const decodedMSO = decodeCbor(msoBytes as Uint8Array);
      const validatedMSO = mobileSecurityObjectSchema.parse(decodedMSO);

      // Verify MSO structure
      expect(validatedMSO.version).toBe('1.0');
      expect(validatedMSO.docType).toBe('org.iso.18013.5.1.mDL');
      expect(validatedMSO.digestAlgorithm).toBe('SHA-256');
      expect(validatedMSO.validityInfo.expectedUpdate).toBeUndefined();
    });
  });
});
