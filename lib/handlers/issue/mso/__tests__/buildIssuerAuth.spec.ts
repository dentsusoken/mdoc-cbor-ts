import { describe, it, expect } from 'vitest';
import { Algorithms, COSEKey, Sign1 } from '@auth0/cose';
import { Tag } from 'cbor-x';
import { createTag24 } from '@/cbor/createTag24';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { buildIssuerAuth } from '../buildIssuerAuth';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): Tag => {
  const issuerSignedItem = new Map<string, unknown>();
  issuerSignedItem.set('digestID', digestID);
  issuerSignedItem.set('random', new Uint8Array(16));
  issuerSignedItem.set('elementIdentifier', elementIdentifier);
  issuerSignedItem.set('elementValue', elementValue);
  return createTag24(issuerSignedItem);
};

describe('buildIssuerAuth', () => {
  it('should build IssuerAuth (COSE_Sign1) for given inputs', async () => {
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', [createIssuerSignedItemTag24(38)]],
    ]);

    const { publicKey: devicePublicKey } = await COSEKey.generate(
      Algorithms.ES256,
      {
        crv: 'P-256',
      }
    );

    const { privateKey: issuerPrivateKey } = await COSEKey.generate(
      Algorithms.ES256,
      {
        crv: 'P-256',
      }
    );

    // const jwk = await privateKey.toJWK();
    // console.log('jwk', jwk);
    // Ensure alg is present for protected headers construction
    // const jwkWithAlg: CoseKeyJwk = { ...jwk, alg: 'ES256' };
    const x5c = [new Uint8Array([0x30, 0x82, 0x01, 0x3d])];

    const issuerAuth = await buildIssuerAuth({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces,
      devicePublicKey,
      digestAlgorithm: 'SHA-256',
      validFrom: 0,
      validUntil: 24 * 60 * 60 * 1000,
      expectedUpdate: 60 * 60 * 1000,
      issuerPrivateKey,
      x5c,
    });

    const expected = [
      expect.any(Uint8Array),
      expect.any(Map<number, unknown>),
      expect.any(Uint8Array),
      expect.any(Uint8Array),
    ];
    expect(issuerAuth).toEqual(expected);

    const result = issuerAuthSchema.safeParse(issuerAuth);

    expect(result.success).toBe(true);
  });
});
