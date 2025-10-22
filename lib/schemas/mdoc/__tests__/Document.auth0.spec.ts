import { describe, expect, it } from 'vitest';
import { documentSchema } from '../Document';
import { Document, MDoc } from '@auth0/mdl';
import { createTag1004 } from '@/cbor/createTag1004';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { Tag } from 'cbor-x';
import { decodeCbor } from '@/cbor/codec';
import { mobileSecurityObjectSchema } from '@/schemas/mso/MobileSecurityObject';
import { createTag0 } from '@/cbor/createTag0';
import { Sign1 } from '@/cose/Sign1';

describe('Document auth0/mdl compatibility', () => {
  it('should parse auth0/mdl created Document after encode/decode', async () => {
    const { ...publicKeyJWK } = DEVICE_JWK;
    const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

    const signed = new Date('2024-01-01T00:00:00Z');
    const validFrom = new Date('2024-01-01T01:00:00Z');
    const validUntil = new Date('2025-01-01T00:00:00Z');
    const expectedUpdate = new Date('2024-06-01T00:00:00Z');

    // Create auth0/mdl document
    const document = await new Document('org.iso.18013.5.1.mDL')
      .addIssuerNameSpace('org.iso.18013.5.1', {
        family_name: 'Doe',
        given_name: 'John',
        birth_date: '1990-01-01',
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

    // Decode the CBOR to get raw structure
    const decoded = decodeCbor(encoded) as Map<string, unknown>;
    const documentsArray = decoded.get('documents') as Map<string, unknown>[];

    // Parse with documentSchema
    const validated = documentSchema.parse(documentsArray[0]);

    // Verify Document structure
    expect(validated.get('docType')).toBe('org.iso.18013.5.1.mDL');
    expect(validated.get('issuerSigned')).toBeDefined();
    expect(validated.get('deviceSigned')).toBeUndefined();
    expect(validated.get('errors')).toBeUndefined();

    const issuerSigned = validated.get('issuerSigned')!;

    // Verify issuerSigned structure
    expect(issuerSigned.get('nameSpaces')).toBeInstanceOf(Map);
    const nameSpaces = issuerSigned.get('nameSpaces')!;
    expect(nameSpaces.size).toBe(1);
    const nameSpace = nameSpaces.get('org.iso.18013.5.1')!;
    expect(nameSpace).toBeInstanceOf(Array);
    expect(nameSpace.length).toBe(3); // family_name, given_name, birth_date
    const auth0Elements = new Map<string, unknown>();
    nameSpace.forEach((item) => {
      expect(item).toBeInstanceOf(Tag);
      expect(item.tag).toBe(24);
      const element = decodeCbor(item.value) as Map<string, unknown>;
      auth0Elements.set(
        element.get('elementIdentifier') as string,
        element.get('elementValue')
      );
    });
    expect(auth0Elements.get('family_name')).toBe('Doe');
    expect(auth0Elements.get('given_name')).toBe('John');
    expect(auth0Elements.get('birth_date')).toEqual(
      createTag1004(new Date('1990-01-01'))
    );

    expect(issuerSigned.get('issuerAuth')).toBeInstanceOf(Tag);
    const issuerAuth = issuerSigned.get('issuerAuth')!;
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
    const issuerPublicKey = sign1.verifyX5Chain();
    expect(() => sign1.verify(issuerPublicKey)).not.toThrow();

    const msoTag24 = decodeCbor(issuerAuth.value[2]) as Tag;
    expect(msoTag24.tag).toBe(24);
    const mso = mobileSecurityObjectSchema.parse(decodeCbor(msoTag24.value));
    expect(mso.get('version')).toBe('1.0');
    expect(mso.get('docType')).toBe('org.iso.18013.5.1.mDL');
    expect(mso.get('digestAlgorithm')).toBe('SHA-256');
    expect(mso.get('deviceKeyInfo')?.get('deviceKey')).toBeInstanceOf(Map);
    expect(mso.get('validityInfo')).toBeInstanceOf(Map);
    const validityInfo = mso.get('validityInfo')!;
    expect(validityInfo.get('signed')).toEqual(createTag0(signed));
    expect(validityInfo.get('validFrom')).toEqual(createTag0(validFrom));
    expect(validityInfo.get('validUntil')).toEqual(createTag0(validUntil));
    expect(validityInfo.get('expectedUpdate')).toEqual(
      createTag0(expectedUpdate)
    );
    expect(mso.get('valueDigests')).toBeInstanceOf(Map);
  });
});
