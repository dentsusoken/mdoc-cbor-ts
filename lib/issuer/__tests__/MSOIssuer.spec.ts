import {
  Algorithms,
  COSEKey,
  Headers,
  ProtectedHeaders,
  Sign1,
  UnprotectedHeaders,
} from '@auth0/cose';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MSOIssuer } from '../MSOIssuer';
import { Configuration } from '@/conf/Configuration';
import { X509Adapter } from '@/adapters/X509Adapter';
import { createTag24 } from '@/cbor/createTag24';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { calculateDigest } from '@/utils/calculateDigest';
// issuerAuthSchema not needed since buildIssuerAuth returns Sign1 instance

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): ReturnType<typeof createTag24> => {
  const issuerSignedItem = new Map<string, unknown>();
  issuerSignedItem.set('digestID', digestID);
  issuerSignedItem.set('random', new Uint8Array(16));
  issuerSignedItem.set('elementIdentifier', elementIdentifier);
  issuerSignedItem.set('elementValue', elementValue);
  return createTag24(issuerSignedItem);
};

describe('MSOIssuer', async () => {
  const configuration = new Configuration({
    digestAlgorithm: 'SHA-256',
    validFrom: 0,
    validUntil: 24 * 60 * 60 * 1000, // +1 day
    expectedUpdate: 60 * 60 * 1000, // +1 hour
  });

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
    x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
    y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
    alg: 'ES256',
    kid: '1234567890',
    use: 'sig',
    x5c: [
      'MIIBfDCCASGgAwIBAgIUEmmlElA5hRjuzPBe8u+gOO/EPVwwCgYIKoZIzj0EAwIwEzERMA8GA1UEAwwIVmVyaWZpZXIwHhcNMjQwODIxMDAzODE4WhcNMjQwOTIwMDAzODE4WjATMREwDwYDVQQDDAhWZXJpZmllcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCVM330iN+v1v58cWOv28j/LMEXupGyGuWwZOJI53ypUOk/X4cfR2I7C1BtfpVPz1H1d26FgrE/L3XlkHPJbfDGjUzBRMB0GA1UdDgQWBBQpvC5mfQK3FJzua7Pk0d00lPQRhDAfBgNVHSMEGDAWgBQpvC5mfQK3FJzua7Pk0d00lPQRhDAPBgNVHRMBAf8EBTADAQH/MAoGCCqGSM49BAMCA0kAMEYCIQCB3AhuOALOaW+5zDgL1mn+U+zGw8WS2zoDZySoC8oCzgIhAKothleK1BWfmpv1Qzy4bQ5+dUj+p2RXjGj/A4zcP/E2',
    ],
  } as const;

  const x509Adapter = await X509Adapter.importJWKPrivateKey(
    jwk as unknown as Parameters<typeof X509Adapter.importJWKPrivateKey>[0]
  );
  const issuer = new MSOIssuer(configuration, x509Adapter);

  describe('calculateValueDigests', () => {
    it('should calculate value digests for namespaces', async () => {
      const tags = [
        createIssuerSignedItemTag24(1),
        createIssuerSignedItemTag24(2),
      ];
      const nameSpaces: IssuerNameSpaces = new Map([
        ['org.iso.18013.5.1', tags],
      ]);

      const valueDigests = await issuer.calculateValueDigests(nameSpaces);

      expect(valueDigests instanceof Map).toBe(true);
      const ns = valueDigests.get('org.iso.18013.5.1');
      expect(ns instanceof Map).toBe(true);
      expect(ns?.get(1)).toEqual(
        await calculateDigest(configuration.digestAlgorithm, tags[0])
      );
      expect(ns?.get(2)).toEqual(
        await calculateDigest(configuration.digestAlgorithm, tags[1])
      );
    });
  });

  describe('prepareValidityInfo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });
    it('should prepare validity info using current time and configuration', () => {
      //vi.useFakeTimers();
      const base = new Date('2025-01-01T00:00:00Z');
      vi.setSystemTime(base);

      const info = issuer.prepareValidityInfo();

      // Base time is fixed by fake timers, compute expected strings explicitly
      const expectedSigned = '2025-01-01T00:00:00Z';
      const expectedValidFrom = '2025-01-01T00:00:00Z';
      const expectedValidUntil = '2025-01-02T00:00:00Z';
      const expectedExpectedUpdate = '2025-01-01T01:00:00Z';

      expect(info.signed).toBe(expectedSigned);
      expect(info.validFrom).toBe(expectedValidFrom);
      expect(info.validUntil).toBe(expectedValidUntil);
      expect(info.expectedUpdate).toBe(expectedExpectedUpdate);

      //vi.useRealTimers();
    });
  });

  describe('prepareHeaders', () => {
    it('should prepare headers including alg, optional kid, and x5c', () => {
      const { protectedHeaders, unprotectedHeaders } = issuer.prepareHeaders();
      expect(protectedHeaders).toBeInstanceOf(ProtectedHeaders);
      expect(unprotectedHeaders).toBeInstanceOf(UnprotectedHeaders);

      const alg = protectedHeaders.get(Headers.Algorithm);
      expect(alg).toBe(Algorithms.ES256);

      const kid = protectedHeaders.get(Headers.KeyID);
      expect(kid).toEqual(jwk.kid);
      //expect(kid).toBeInstanceOf(Uint8Array);
      // } else {
      //   expect(typeof kid).toBe('string');
      // }

      const x5c = unprotectedHeaders.get(Headers.X5Chain);
      expect(x5c).toBeInstanceOf(Uint8Array);
    });

    it('should throw if alg is missing when preparing headers', () => {
      const spy = vi.spyOn(x509Adapter, 'privateKey', 'get');
      try {
        const key = COSEKey.fromJWK({
          ...(jwk as unknown as Record<string, unknown>),
          alg: undefined,
        } as Parameters<typeof COSEKey.fromJWK>[0]);
        spy.mockReturnValue(key);

        expect(() => issuer.prepareHeaders()).toThrow(
          'Signing Key must have alg claim.'
        );
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('buildIssuerAuth', () => {
    it('should build IssuerAuth (COSE_Sign1) for given inputs', async () => {
      const nameSpaces: IssuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [createIssuerSignedItemTag24(38)]],
      ]);
      const { publicKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });

      const issuerAuth = await issuer.buildIssuerAuth(
        'org.iso.18013.5.1.mDL',
        nameSpaces,
        publicKey
      );
      expect(issuerAuth).toBeInstanceOf(Sign1);
    });
  });
});
