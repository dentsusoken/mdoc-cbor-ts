import { describe, it, expect } from 'vitest';
import { KJUR, X509 } from 'jsrsasign';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { verifyX5Chain } from '../verifyX509s';
import { pemToX509 } from '../pemToX509';

/**
 * Utility to convert KJUR.asn1.x509.Certificate to jsrsasign X509
 */
const toX509 = (cert: KJUR.asn1.x509.Certificate): X509 => {
  const pem = cert.getPEM();
  return pemToX509(pem);
};

describe('verifyX509s', () => {
  const p256 = createSignatureCurve('P-256', randomBytes);

  it('verifies a single self-signed certificate (root)', () => {
    const priv = p256.randomPrivateKey();
    const pub = p256.getPublicKey(priv);
    const jwkPub = p256.toJwkPublicKey(pub);
    const jwkPriv = p256.toJwkPrivateKey(priv);

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey: jwkPub,
      caJwkPrivateKey: jwkPriv,
      subject: 'Root',
      validityDays: 1,
      serialHex: '01',
      digestAlgorithm: 'SHA-256',
    });

    const x509 = toX509(cert);
    const results = verifyX5Chain([x509]);
    expect(results).toEqual([true]);
  });

  it('verifies a simple chain: leaf -> root (root self-signed)', () => {
    // Root keypair
    const rootPriv = p256.randomPrivateKey();
    const rootPub = p256.getPublicKey(rootPriv);
    const rootJwkPub = p256.toJwkPublicKey(rootPub);
    const rootJwkPriv = p256.toJwkPrivateKey(rootPriv);

    // Root certificate (self-signed)
    const rootCert = createSelfSignedCertificate({
      subjectJwkPublicKey: rootJwkPub,
      caJwkPrivateKey: rootJwkPriv,
      subject: 'Root',
      validityDays: 1,
      serialHex: '10',
      digestAlgorithm: 'SHA-256',
    });

    // Leaf keypair
    const leafPriv = p256.randomPrivateKey();
    const leafPub = p256.getPublicKey(leafPriv);
    const leafJwkPub = p256.toJwkPublicKey(leafPub);

    // Leaf certificate signed by root CA key using helper
    const leafCert = createSelfSignedCertificate({
      subjectJwkPublicKey: leafJwkPub,
      caJwkPrivateKey: rootJwkPriv,
      subject: 'Leaf',
      validityDays: 1,
      serialHex: '11',
      digestAlgorithm: 'SHA-256',
    });

    const leafX = toX509(leafCert);
    const rootX = toX509(rootCert);

    const results = verifyX5Chain([leafX, rootX]);
    expect(results).toEqual([true, true]);
  });

  it('detects invalid signature when parent public key does not match', () => {
    // Parent (root)
    const rootPriv = p256.randomPrivateKey();
    const rootJwkPriv = p256.toJwkPrivateKey(rootPriv);

    // Leaf signed by root
    const leafPriv = p256.randomPrivateKey();
    const leafPub = p256.getPublicKey(leafPriv);
    const leafJwkPub = p256.toJwkPublicKey(leafPub);

    const leafCert = createSelfSignedCertificate({
      subjectJwkPublicKey: leafJwkPub,
      caJwkPrivateKey: rootJwkPriv,
      subject: 'Leaf',
      validityDays: 1,
      serialHex: '31',
      digestAlgorithm: 'SHA-256',
    });

    // Mismatched parent public key (use a fresh unrelated self-signed cert as parent element)
    const bogusPriv = p256.randomPrivateKey();
    const bogusPub = p256.getPublicKey(bogusPriv);
    const bogusJwkPub = p256.toJwkPublicKey(bogusPub);
    const bogusJwkPriv = p256.toJwkPrivateKey(bogusPriv);
    const bogusParent = createSelfSignedCertificate({
      subjectJwkPublicKey: bogusJwkPub,
      caJwkPrivateKey: bogusJwkPriv,
      subject: 'Bogus',
      validityDays: 1,
      serialHex: '32',
      digestAlgorithm: 'SHA-256',
    });

    const leafX = toX509(leafCert);
    const bogusX = toX509(bogusParent);

    const results = verifyX5Chain([leafX, bogusX]);
    expect(results[0]).toBe(false);
    expect(results[1]).toBe(true);
  });
});
