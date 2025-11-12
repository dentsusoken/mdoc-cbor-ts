import { describe, it, expect } from 'vitest';
import { verifyIssuerSigned } from '../verifyIssuerSigned';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { Header, Algorithm } from '@/cose/types';
import { encodeCbor } from '@/cbor/codec';
import { createTag18 } from '@/cbor/createTag18';
import { Sign1 } from '@/cose/Sign1';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerSigned, createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';

const buildNameSpaces = (): IssuerNameSpaces => {
  const item = createIssuerSignedItem([
    ['digestID', 1],
    ['random', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])],
    ['elementIdentifier', 'given_name'],
    ['elementValue', 'Alice'],
  ]);
  const tag = createTag24(item);
  const map: Map<string, Tag[]> = new Map([['org.iso.18013.5.1', [tag]]]);
  return map;
};

const p256 = createSignatureCurve('P-256', randomBytes);

describe('verifyIssuerSigned', () => {
  const now = new Date();
  const clockSkew = 60;

  describe('success cases', () => {
    it('verifies a valid IssuerSigned and does not throw', () => {
      const nameSpaces = buildNameSpaces();

      // Build MSO
      const priv = p256.randomPrivateKey();
      const pub = p256.getPublicKey(priv);
      const jwkPriv = p256.toJwkPrivateKey(priv);
      const jwkPub = p256.toJwkPublicKey(pub);

      const signed = new Date();
      const validFrom = new Date(signed.getTime());
      const validUntil = new Date(signed.getTime() + 24 * 60 * 60 * 1000);

      const mso = buildMobileSecurityObject({
        docType: 'org.iso.18013.5.1.mDL',
        nameSpaces,
        deviceJwkPublicKey: jwkPub,
        digestAlgorithm: 'SHA-256',
        signed,
        validFrom,
        validUntil,
      });

      // Build issuerAuth COSE_Sign1 with x5chain and payload = CBOR(MSO)
      const cert = createSelfSignedCertificate({
        subjectJwkPublicKey: jwkPub,
        caJwkPrivateKey: jwkPriv,
        subject: 'Issuer',
        serialHex: '11',
        digestAlgorithm: 'SHA-256',
      });
      const der = certificateToDerBytes(cert);
      const ph = new Map<number, unknown>([
        [Header.Algorithm, Algorithm.ES256],
      ]);
      const uh = new Map<number, unknown>([[Header.X5Chain, [der]]]);
      const payload = encodeCbor(createTag24(mso));

      const sign1 = Sign1.sign({
        protectedHeaders: encodeCbor(ph),
        unprotectedHeaders: uh,
        payload,
        jwkPrivateKey: jwkPriv,
      });

      const issuerSigned: IssuerSigned = createIssuerSigned([
        ['nameSpaces', nameSpaces],
        ['issuerAuth', createTag18(sign1.getContentForEncoding())],
      ]);

      expect(() =>
        verifyIssuerSigned({ issuerSigned, now, clockSkew })
      ).not.toThrow();
    });
  });

  describe('error cases', () => {
    it('throws when nameSpaces is missing', () => {
      const issuerSigned = new Map<string, unknown>([
        ['issuerAuth', new Map<string, unknown>()],
      ]) as unknown as IssuerSigned;

      try {
        verifyIssuerSigned({ issuerSigned, now, clockSkew });
        throw new Error('Should have thrown');
      } catch (e) {
        const code = MdocErrorCode.IssuerNameSpacesMissing;
        const name = MdocErrorCode[code];
        expect((e as Error).message).toBe(
          `NameSpaces are missing - ${code} - ${name}`
        );
      }
    });

    it('throws when issuerAuth is missing', () => {
      const nameSpaces = buildNameSpaces();
      const issuerSigned = new Map<string, unknown>([
        ['nameSpaces', nameSpaces],
      ]) as unknown as IssuerSigned;

      try {
        verifyIssuerSigned({ issuerSigned, now, clockSkew });
        throw new Error('Should have thrown');
      } catch (e) {
        const code = MdocErrorCode.IssuerAuthMissing;
        const name = MdocErrorCode[code];
        expect((e as Error).message).toBe(
          `IssuerAuth is missing - ${code} - ${name}`
        );
      }
    });
  });
});
