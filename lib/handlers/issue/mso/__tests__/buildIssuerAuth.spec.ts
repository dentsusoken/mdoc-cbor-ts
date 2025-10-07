import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { buildIssuerAuth } from '../buildIssuerAuth';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { buildProtectedHeaders } from '../../cose/buildProtectedHeaders';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { buildUnprotectedHeaders } from '../../cose/buildUnprotectedHeaders';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { createTag1004 } from '@/cbor/createTag1004';
import { Sign1 } from '@/cose/Sign1';
import { Document, MDoc, parse } from '@auth0/mdl';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/../lib/mdl/__tests__/issuing/config';
import { mobileSecurityObjectSchema } from '@/schemas/mso/MobileSecurityObject';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('buildIssuerAuth', () => {
  it('should build IssuerAuth (COSE_Sign1) for given inputs', () => {
    const nameSpaceElements: NameSpaceElements = {
      'org.iso.18013.5.1': {
        given_name: 'JOHN',
        family_name: 'DOE',
        birth_date: createTag1004(new Date('1990-01-01')),
      },
    };

    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);

    const certificate = createSelfSignedCertificate({
      subjectJwkPublicKey: jwkPublicKey,
      caJwkPrivateKey: jwkPrivateKey,
      subject: 'Sign1 Interop',
      serialHex: '02',
    });
    const x5c = [certificateToDerBytes(certificate)];
    const protectedHeaders = encodeCbor(buildProtectedHeaders(jwkPrivateKey));
    const unprotectedHeaders = buildUnprotectedHeaders(x5c);

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T00:00:00Z');
    const validUntil = new Date('2024-01-02T00:00:00Z'); // +1 day
    const expectedUpdate = new Date('2024-01-01T01:00:00Z'); // +1 hour

    const issuerAuth = buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaceElements,
      randomBytes,
      deviceJwkPublicKey: jwkPublicKey,
      digestAlgorithm: 'SHA-256',
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
      protectedHeaders,
      unprotectedHeaders,
      issuerJwkPrivateKey: jwkPrivateKey,
    });

    expect(issuerAuth).toBeInstanceOf(Tag);
    expect(issuerAuth.tag).toBe(18);
    expect(issuerAuth.value).toBeInstanceOf(Array);
    expect(issuerAuth.value).toHaveLength(4);
    expect(issuerAuth.value[0]).toEqual(protectedHeaders);
    expect(issuerAuth.value[1]).toEqual(unprotectedHeaders);
    expect(issuerAuth.value[2]).toBeInstanceOf(Uint8Array);
    expect(issuerAuth.value[3]).toBeInstanceOf(Uint8Array);

    const result = issuerAuthSchema.parse(issuerAuth);
    const sign1 = new Sign1(
      result.value[0],
      result.value[1],
      result.value[2],
      result.value[3]
    );
    const issuerJwkPublicKey = sign1.verifyX509Chain();

    expect(result).toEqual(issuerAuth);
    expect(() => sign1.verify(issuerJwkPublicKey)).not.toThrow();
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

      const issuerPublicKey = sign1.verifyX509Chain();

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
