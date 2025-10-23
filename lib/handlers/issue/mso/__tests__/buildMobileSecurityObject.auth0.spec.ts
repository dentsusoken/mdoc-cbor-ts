import { describe, expect, it } from 'vitest';
import { buildMobileSecurityObject } from '../buildMobileSecurityObject';
import { Document, MDoc, parse } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { Tag } from 'cbor-x';
import { Key } from '@/cose/types';

describe('buildMobileSecurityObject auth0/mdl compatibility', () => {
  it('should produce same MSO structure as auth0/mdl', async () => {
    const nameSpace = 'org.iso.18013.5.1';
    const digestAlgorithm = 'SHA-256';

    // Create auth0/mdl document
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { d: _unused, ...publicKeyJWK } = DEVICE_JWK;
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

    const auth0MSO = parsedDocument.issuerSigned.issuerAuth
      .decodedPayload as MSO;
    expect(auth0MSO).toBeDefined();
    const auth0IssuerSignedItems =
      parsedDocument.issuerSigned.nameSpaces?.[nameSpace];
    expect(auth0IssuerSignedItems).toBeDefined();

    const tags = auth0IssuerSignedItems!.map(
      (item) => new Tag(item.dataItem.buffer, 24)
    );

    const nameSpaces = new Map([[nameSpace, tags]]);

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
    expect(ourMSO.get('version')).toBe('1.0');
    expect(ourMSO.get('docType')).toBe(auth0MSO.docType);
    expect(ourMSO.get('digestAlgorithm')).toBe(auth0MSO.digestAlgorithm);

    expect(ourMSO.get('valueDigests')).toBeInstanceOf(Map);
    const ourValueDigests = ourMSO.get('valueDigests')!;
    const auth0ValueDigests = auth0MSO.valueDigests!;
    expect(ourValueDigests.size).toBe(auth0ValueDigests.size);

    expect(ourValueDigests.get(nameSpace)).toBeInstanceOf(Map);
    const ourNameSpaceDigests = ourValueDigests.get(nameSpace)!;
    const auth0NameSpaceDigests = auth0ValueDigests.get(nameSpace);
    expect(ourNameSpaceDigests).toBeDefined();
    expect(auth0NameSpaceDigests).toBeDefined();
    const auth0NameSpaceDigests2 = new Map(
      [...auth0NameSpaceDigests!.entries()].map(([key, value]) => [
        key,
        Uint8Array.from(value),
      ])
    );
    expect(ourNameSpaceDigests).toEqual(auth0NameSpaceDigests2);

    const auth0ValidityInfo = auth0MSO.validityInfo;
    expect(ourMSO.get('validityInfo')).toBeInstanceOf(Map);
    const ourValidityInfo = ourMSO.get('validityInfo')!;
    expect(new Date(ourValidityInfo.get('signed')!.value)).toEqual(
      auth0ValidityInfo.signed
    );
    expect(new Date(ourValidityInfo.get('validFrom')!.value)).toEqual(
      auth0ValidityInfo.validFrom
    );
    expect(new Date(ourValidityInfo.get('validUntil')!.value)).toEqual(
      auth0ValidityInfo.validUntil
    );
    expect(new Date(ourValidityInfo.get('expectedUpdate')!.value)).toEqual(
      auth0ValidityInfo.expectedUpdate
    );

    expect(ourMSO.get('deviceKeyInfo')).toBeInstanceOf(Map);
    const ourDeviceKeyInfo = ourMSO.get('deviceKeyInfo')!;
    expect(ourDeviceKeyInfo.get('deviceKey')).toBeInstanceOf(Map);
    const ourDeviceKey = ourDeviceKeyInfo.get('deviceKey')!;
    ourDeviceKey.delete(Key.Algorithm);
    const auth0DeviceKey = auth0MSO.deviceKeyInfo!.deviceKey!;
    auth0DeviceKey.set(
      Key.x,
      Uint8Array.from(auth0DeviceKey.get(Key.x) as Uint8Array)
    );
    auth0DeviceKey.set(
      Key.y,
      Uint8Array.from(auth0DeviceKey.get(Key.y) as Uint8Array)
    );
    expect(ourDeviceKey).toEqual(auth0DeviceKey);
  });
});
