import { describe, expect, it } from 'vitest';
import { buildMobileSecurityObject } from '../buildMobileSecurityObject';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { generateP256KeyPair } from '@/jsrsasign';
import { jwkToCosePublicKey } from '@/cose/jwkToCosePublicKey';
import { buildValueDigests } from '../buildValueDigests';
import { buildValidityInfo } from '../buildValidityInfo';

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): ReturnType<typeof createTag24> => {
  const issuerSignedItem: IssuerSignedItem = {
    digestID,
    random: new Uint8Array(16),
    elementIdentifier,
    elementValue,
  };
  return createTag24(issuerSignedItem);
};

describe('buildMobileSecurityObject', () => {
  const baseDate = new Date('2024-01-01T00:00:00Z');
  const validFrom = 0;
  const validUntil = validFrom + 24 * 60 * 60; // +1 day
  const expectedUpdate = validFrom + 60 * 60; // +1 hour

  it('should create a mobile security object with all required fields', async () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const tag24 = createIssuerSignedItemTag24(1);
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', [tag24]],
    ]);
    const { publicJwk } = generateP256KeyPair();
    const deviceKey = jwkToCosePublicKey(publicJwk);
    const digestAlgorithm = 'SHA-256';
    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm,
    });

    const validityInfo = buildValidityInfo({
      baseDate,
      validFrom,
      validUntil,
      expectedUpdate,
    });

    const mso = await buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceKey,
      digestAlgorithm,
      baseDate,
      validFrom,
      validUntil,
      expectedUpdate,
    });

    expect(mso).toEqual({
      version: '1.0',
      docType,
      digestAlgorithm: 'SHA-256',
      valueDigests,
      validityInfo,
      deviceKeyInfo: {
        deviceKey,
      },
    });
  });

  it('should create a mobile security object without expectedUpdate', async () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const tag24 = createIssuerSignedItemTag24(1);
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', [tag24]],
    ]);
    const { publicJwk } = generateP256KeyPair();
    const deviceKey = jwkToCosePublicKey(publicJwk);
    const digestAlgorithm = 'SHA-256';
    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm,
    });

    const validityInfo = buildValidityInfo({
      baseDate,
      validFrom,
      validUntil,
    });

    const mso = await buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceKey,
      digestAlgorithm,
      baseDate,
      validFrom,
      validUntil,
    });

    expect(mso).toEqual({
      version: '1.0',
      docType,
      digestAlgorithm: 'SHA-256',
      valueDigests,
      validityInfo,
      deviceKeyInfo: {
        deviceKey,
      },
    });
  });
});
