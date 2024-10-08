import { describe, it, expect } from 'vitest';
import { MSO } from './MSO';
import { MSOPayload } from './MSOPayload';
import {
  ProtectedHeaders,
  UnprotectedHeaders,
  Sign1,
  Headers,
  Algorithms,
} from '@auth0/cose';
import { DateTime } from 'luxon';
import * as x509 from '@peculiar/x509';

const alg = {
  name: 'RSASSA-PKCS1-v1_5',
  hash: 'SHA-256',
  publicExponent: new Uint8Array([1, 0, 1]),
  modulusLength: 2048,
};
const keys = await crypto.subtle.generateKey(alg, false, ['sign', 'verify']);
const cert = await x509.X509CertificateGenerator.createSelfSigned({
  serialNumber: '01',
  name: 'CN=Test',
  notBefore: new Date('2020/01/01'),
  notAfter: new Date('2020/01/02'),
  signingAlgorithm: alg,
  keys,
  extensions: [
    new x509.BasicConstraintsExtension(true, 2, true),
    new x509.ExtendedKeyUsageExtension(
      ['1.2.3.4.5.6.7', '2.3.4.5.6.7.8'],
      true
    ),
    new x509.KeyUsagesExtension(
      x509.KeyUsageFlags.keyCertSign | x509.KeyUsageFlags.cRLSign,
      true
    ),
    await x509.SubjectKeyIdentifierExtension.create(keys.publicKey),
  ],
});

describe('MSO', () => {
  describe('constructor', () => {
    it('should initialize with given parameters', () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });
      const mso = new MSO(
        new ProtectedHeaders(),
        new UnprotectedHeaders(),
        payload
      );

      expect(mso.payload).toBe(payload);
    });
  });

  describe('sign', () => {
    it('should sign the MSO', async () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });

      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const mso = new MSO(protectedHeaders, new UnprotectedHeaders(), payload);
      const { privateKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const sign1 = await mso.sign(privateKey);

      expect(sign1).toBeInstanceOf(Sign1);
    });
  });

  describe('x5Chain', () => {
    it('should return an array of X509 certificates', () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });
      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const unprotectedHeaders = new UnprotectedHeaders();
      unprotectedHeaders.set(Headers.X5Chain, new Uint8Array(cert.rawData));
      const mso = new MSO(protectedHeaders, unprotectedHeaders, payload);
      const certs = mso.x5Chain;

      expect(certs[0]).toBeInstanceOf(x509.X509Certificate);
    });
    it('should return an empty array if no certificates are set', () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });
      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const unprotectedHeaders = new UnprotectedHeaders();
      unprotectedHeaders.set(Headers.X5Chain, [new Uint8Array(cert.rawData)]);
      const mso = new MSO(protectedHeaders, unprotectedHeaders, payload);
      const certs = mso.x5Chain;

      expect(certs[0]).toBeInstanceOf(x509.X509Certificate);
    });
  });

  describe('decode', () => {
    it('should decode a CBOR string to an MSO instance', async () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });

      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const mso = new MSO(protectedHeaders, new UnprotectedHeaders(), payload);
      const { privateKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const sign1 = await mso.sign(privateKey);
      const cbor = sign1.encode();

      expect(MSO.decode(cbor)).toBeInstanceOf(MSO);
    });

    it('should decode a CBOR bytes to an MSO instance', async () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });

      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const mso = new MSO(protectedHeaders, new UnprotectedHeaders(), payload);
      const { privateKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const sign1 = await mso.sign(privateKey);
      const cbor = sign1.encode().toString('hex');

      expect(MSO.decode(cbor)).toBeInstanceOf(MSO);
    });
  });

  describe('verify', () => {
    it('should verify the MSO signature', async () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });

      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const mso = new MSO(protectedHeaders, new UnprotectedHeaders(), payload);
      const { privateKey, publicKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const sign1 = await mso.sign(privateKey);
      const cbor = sign1.encode();
      const isValid = await MSO.decode(cbor).verify(publicKey);

      expect(isValid).toBe(true);
    });
    it('should return false if the signature is invalid', async () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });

      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const mso = new MSO(protectedHeaders, new UnprotectedHeaders(), payload);
      const { privateKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const { publicKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const sign1 = await mso.sign(privateKey);
      const cbor = sign1.encode();
      const isValid = await MSO.decode(cbor).verify(publicKey);

      expect(isValid).toBe(false);
    });
    it('should return false if sign1 is undefined', async () => {
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo: {
          signed: DateTime.now(),
          validFrom: DateTime.now(),
          validUntil: DateTime.now(),
        },
      });
      const { publicKey } = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );

      const protectedHeaders = new ProtectedHeaders();
      protectedHeaders.set(Headers.Algorithm, Algorithms.ES256);
      const mso = new MSO(protectedHeaders, new UnprotectedHeaders(), payload);
      const isValid = await mso.verify(publicKey);

      expect(isValid).toBe(false);
    });
  });
});
