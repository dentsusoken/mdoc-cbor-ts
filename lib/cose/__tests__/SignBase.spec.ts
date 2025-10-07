import { describe, it, expect } from 'vitest';
import { SignBase } from '../SignBase';
import { Headers } from '../types';
import { encodeCbor } from '@/cbor/codec';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';

const p256 = createSignatureCurve('P-256', randomBytes);
const ed25519 = createSignatureCurve('Ed25519', randomBytes);

const pickEcPublicJwkFields = (
  jwk: Record<string, unknown>
): { kty: unknown; crv: unknown; x: unknown; y: unknown } => ({
  kty: jwk.kty,
  crv: jwk.crv,
  x: jwk.x,
  y: jwk.y,
});

describe('SignBase', () => {
  describe('constructor behavior', () => {
    it('stores protected headers as CBOR bytes and decodes to map', () => {
      const ph = new Map<number, unknown>([[Headers.ContentType, 42]]);
      const encoded = encodeCbor(ph);
      const uh = new Map<number, unknown>();
      const sig = new Uint8Array([1, 2, 3]);

      const sb = new SignBase(encoded, uh, sig);

      expect(sb).toBeInstanceOf(SignBase);
      expect(sb.protectedHeaders).toEqual(encoded);
      expect(sb.decodedProtectedHeaders.get(Headers.ContentType)).toBe(42);
      expect(sb.signature).toEqual(sig);
    });
  });

  describe('x5c getter', () => {
    it('returns chain from protected headers', () => {
      const der = new Uint8Array([0x01, 0x02]);
      const ph = new Map<number, unknown>([[Headers.X5Chain, [der]]]);
      const uh = new Map<number, unknown>();

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());

      expect(sb.x5c).toEqual([der]);
    });

    it('returns chain from unprotected headers when not in protected', () => {
      const der = new Uint8Array([0x0a, 0x0b]);
      const ph = new Map<number, unknown>();
      const uh = new Map<number, unknown>([[Headers.X5Chain, [der]]]);

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());

      expect(sb.x5c).toEqual([der]);
    });

    it('converts single certificate to array from protected headers', () => {
      const der = new Uint8Array([0x03, 0x04]);
      const ph = new Map<number, unknown>([[Headers.X5Chain, der]]);
      const uh = new Map<number, unknown>();

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());

      expect(sb.x5c).toEqual([der]);
      expect(Array.isArray(sb.x5c)).toBe(true);
      expect(sb.x5c).toHaveLength(1);
    });

    it('converts single certificate to array from unprotected headers', () => {
      const der = new Uint8Array([0x05, 0x06]);
      const ph = new Map<number, unknown>();
      const uh = new Map<number, unknown>([[Headers.X5Chain, der]]);

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());

      expect(sb.x5c).toEqual([der]);
      expect(Array.isArray(sb.x5c)).toBe(true);
      expect(sb.x5c).toHaveLength(1);
    });

    it('returns undefined when x5c is missing (e.g., Device Authentication)', () => {
      const ph = new Map<number, unknown>();
      const uh = new Map<number, unknown>();

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());

      expect(sb.x5c).toBeUndefined();
    });
  });

  describe('verifyX509Chain', () => {
    it('throws when x5c is not present (e.g., Device Authentication)', () => {
      const ph = new Map<number, unknown>();
      const uh = new Map<number, unknown>();

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());

      expect(() => sb.verifyX509Chain()).toThrowError(
        'X.509 certificate chain not found'
      );
    });

    it('returns leaf public key JWK for a valid self-signed chain', () => {
      const privateKey = p256.randomPrivateKey();
      const publicKey = p256.getPublicKey(privateKey);
      const jwkPublicKey = p256.toJwkPublicKey(publicKey);
      const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);

      const cert = createSelfSignedCertificate({
        subjectJwkPublicKey: jwkPublicKey,
        caJwkPrivateKey: jwkPrivateKey,
        subject: 'SignBase Test',
        serialHex: '01',
      });
      const der = certificateToDerBytes(cert);

      const ph = new Map<number, unknown>([[Headers.X5Chain, [der]]]);
      const uh = new Map<number, unknown>();

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());
      const jwk = sb.verifyX509Chain();

      expect(pickEcPublicJwkFields(jwk)).toEqual(
        pickEcPublicJwkFields(jwkPublicKey)
      );
    });

    it('throws for an invalid chain (mismatched issuer)', () => {
      const aPrvRaw = p256.randomPrivateKey();
      const aPubRaw = p256.getPublicKey(aPrvRaw);
      const aPub = p256.toJwkPublicKey(aPubRaw);
      const aPrv = p256.toJwkPrivateKey(aPrvRaw);
      const certA = createSelfSignedCertificate({
        subjectJwkPublicKey: aPub,
        caJwkPrivateKey: aPrv,
        subject: 'A',
        serialHex: '01',
      });
      const bPrvRaw = p256.randomPrivateKey();
      const bPubRaw = p256.getPublicKey(bPrvRaw);
      const bPub = p256.toJwkPublicKey(bPubRaw);
      const bPrv = p256.toJwkPrivateKey(bPrvRaw);
      const certB = createSelfSignedCertificate({
        subjectJwkPublicKey: bPub,
        caJwkPrivateKey: bPrv,
        subject: 'B',
        serialHex: '02',
      });

      const derA = certificateToDerBytes(certA);
      const derB = certificateToDerBytes(certB);

      // Intentionally incorrect chain order/issuers: leaf A followed by unrelated B
      const ph = new Map<number, unknown>([[Headers.X5Chain, [derA, derB]]]);
      const uh = new Map<number, unknown>();

      const sb = new SignBase(encodeCbor(ph), uh, new Uint8Array());
      expect(() => sb.verifyX509Chain()).toThrowError(
        'Invalid X.509 certificate chain'
      );
    });
  });

  describe('internalVerify', () => {
    it('returns true for a valid signature (P-256)', () => {
      const privateKey = p256.randomPrivateKey();
      const message = new Uint8Array([1, 2, 3, 4]);
      const signature = p256.sign({ privateKey, message });
      const jwkPublicKey = p256.toJwkPublicKey(p256.getPublicKey(privateKey));

      const sb = new SignBase(
        encodeCbor(new Map<number, unknown>()),
        new Map<number, unknown>(),
        signature
      );

      const ok = sb.internalVerify({
        jwkPublicKey,
        toBeSigned: message,
      });
      expect(ok).toBe(true);
    });

    it('returns false for a wrong message', () => {
      const privateKey = p256.randomPrivateKey();
      const message = new Uint8Array([5, 6, 7, 8]);
      const signature = p256.sign({ privateKey, message });
      const publicJwk = p256.toJwkPublicKey(p256.getPublicKey(privateKey));

      const sb = new SignBase(
        encodeCbor(new Map<number, unknown>()),
        new Map<number, unknown>(),
        signature
      );

      const wrongMessage = new Uint8Array(message);
      wrongMessage[0] ^= 0xff;

      const ok = sb.internalVerify({
        jwkPublicKey: publicJwk,
        toBeSigned: wrongMessage,
      });
      expect(ok).toBe(false);
    });

    it('returns false for a mismatched public key', () => {
      const privateKeyA = p256.randomPrivateKey();
      const privateKeyB = p256.randomPrivateKey();
      const message = new Uint8Array([9, 10, 11]);
      const signature = p256.sign({ privateKey: privateKeyA, message });
      const publicJwkB = p256.toJwkPublicKey(p256.getPublicKey(privateKeyB));

      const sb = new SignBase(
        encodeCbor(new Map<number, unknown>()),
        new Map<number, unknown>(),
        signature
      );

      const ok = sb.internalVerify({
        jwkPublicKey: publicJwkB,
        toBeSigned: message,
      });
      expect(ok).toBe(false);
    });

    it('verifies Ed25519 signatures', () => {
      const privateKey = ed25519.randomPrivateKey();
      const publicKey = ed25519.getPublicKey(privateKey);
      //console.log('publicKey', publicKey);
      const message = new Uint8Array([0, 1, 2, 3, 4]);
      const signature = ed25519.sign({ privateKey, message });
      const publicJwk = ed25519.toJwkPublicKey(publicKey);

      const sb = new SignBase(
        encodeCbor(new Map<number, unknown>()),
        new Map<number, unknown>(),
        signature
      );

      const ok = sb.internalVerify({
        jwkPublicKey: publicJwk,
        toBeSigned: message,
      });
      expect(ok).toBe(true);
    });
  });
});
