import { describe, it, expect } from 'vitest';
import { verifyIssuerAuthTuple } from '../verifyIssuerAuthTuple';
import { Sign1 } from '@/cose/Sign1';
import { Header, Algorithm } from '@/cose/types';
import { encodeCbor } from '@/cbor/codec';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { MDocErrorCode } from '@/mdoc/types';

const p256 = createSignatureCurve('P-256', randomBytes);

const buildTuple = (params: {
  certPrivSameAsSignPriv: boolean;
  includeX5Chain: boolean;
  payload: Uint8Array | null;
  detachedPayload?: Uint8Array;
}) => {
  const signPriv = p256.randomPrivateKey();
  const signJwkPriv = p256.toJwkPrivateKey(signPriv);

  const certPriv = params.certPrivSameAsSignPriv
    ? signPriv
    : p256.randomPrivateKey();
  const certPub = p256.getPublicKey(certPriv);
  const certJwkPriv = p256.toJwkPrivateKey(certPriv);
  const certJwkPub = p256.toJwkPublicKey(certPub);

  const cert = createSelfSignedCertificate({
    subjectJwkPublicKey: certJwkPub,
    caJwkPrivateKey: certJwkPriv,
    subject: 'Issuer',
    serialHex: 'aa',
    digestAlgorithm: 'SHA-256',
  });
  const der = certificateToDerBytes(cert);

  const ph = new Map<number, unknown>([[Header.Algorithm, Algorithm.ES256]]);
  const uh = params.includeX5Chain
    ? new Map<number, unknown>([[Header.X5Chain, [der]]])
    : new Map<number, unknown>();

  const sign1 = Sign1.sign({
    protectedHeaders: encodeCbor(ph),
    unprotectedHeaders: uh,
    payload: params.payload,
    detachedPayload: params.detachedPayload,
    jwkPrivateKey: signJwkPriv,
  });

  return sign1.getContentForEncoding();
};

describe('verifyIssuerAuthTuple', () => {
  const now = new Date();
  const clockSkew = 60;

  describe('success cases', () => {
    it('returns payload when chain and signature verification succeed', () => {
      const payload = new Uint8Array([1, 2, 3]);
      const tuple = buildTuple({
        certPrivSameAsSignPriv: true,
        includeX5Chain: true,
        payload,
      });
      const out = verifyIssuerAuthTuple(tuple, now, clockSkew);
      expect(out).toEqual(payload);
    });
  });

  describe('error cases', () => {
    it('throws X5ChainVerificationFailed when x5chain is missing', () => {
      const payload = new Uint8Array([7, 8, 9]);
      const tuple = buildTuple({
        certPrivSameAsSignPriv: true,
        includeX5Chain: false,
        payload,
      });

      try {
        verifyIssuerAuthTuple(tuple, now, clockSkew);
        throw new Error('Should have thrown');
      } catch (e) {
        const code = MDocErrorCode.X5ChainVerificationFailed;
        const name = MDocErrorCode[code];
        expect((e as Error).message).toBe(
          `Failed to verify the X.509 certificate chain: X.509 certificate chain not found - ${code} - ${name}`
        );
      }
    });

    it('throws IssuerAuthSignatureVerificationFailed when signature does not match x5chain public key', () => {
      const payload = new Uint8Array([9, 9, 9]);
      const tuple = buildTuple({
        certPrivSameAsSignPriv: false, // mismatch signer and cert
        includeX5Chain: true,
        payload,
      });

      try {
        verifyIssuerAuthTuple(tuple, now, clockSkew);
        throw new Error('Should have thrown');
      } catch (e) {
        const code = MDocErrorCode.IssuerAuthSignatureVerificationFailed;
        const name = MDocErrorCode[code];
        expect((e as Error).message).toBe(
          `Failed to verify the IssuerAuth signature: Failed to verify COSE_Sign1 signature - ${code} - ${name}`
        );
      }
    });

    it('throws DetachedPayloadRequired when payload is null', () => {
      const detached = new Uint8Array([1, 1, 2, 3, 5]);
      const tuple = buildTuple({
        certPrivSameAsSignPriv: true,
        includeX5Chain: true,
        payload: null,
        detachedPayload: detached,
      });

      try {
        verifyIssuerAuthTuple(tuple, now, clockSkew);
        throw new Error('Should have thrown');
      } catch (e) {
        const code = MDocErrorCode.DetachedPayloadRequired;
        const name = MDocErrorCode[code];
        expect((e as Error).message).toBe(
          `Detached payload is required when payload is null - ${code} - ${name}`
        );
      }
    });
  });
});
