import { KEYUTIL, KJUR } from 'jsrsasign';
import type { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { ECPrivateJwk, ECPublicJwk } from '@/crypto/types';
import { digestAlgorithmToSigalg } from '@/crypto/digestAlgorithmToSigalg';
import { toX509Time } from './toX509Time';

type CreateSelfSignedCertificateParams = {
  subjectPublicJwk: ECPublicJwk;
  caPrivateJwk: ECPrivateJwk;
  digestAlgorithm?: DigestAlgorithm;
  subject: string;
  validityDays?: number;
  serialHex: string;
};

/**
 * Creates a self-signed X.509 certificate using EC keys in JWK format.
 * @description
 * Generates a self-signed certificate with the specified subject and validity period.
 * The certificate includes basic constraints (non-CA) and digital signature key usage.
 * Uses jsrsasign library for certificate generation with ECDSA signature algorithms.
 *
 * @param params - Certificate creation parameters
 * @param params.subjectPublicJwk - EC public key in JWK format for the certificate subject
 * @param params.caPrivateJwk - EC private key in JWK format for signing (same as subject for self-signed)
 * @param params.digestAlgorithm - Digest algorithm for signature (defaults to 'SHA-256')
 * @param params.subject - Common name for the certificate subject
 * @param params.validityDays - Certificate validity period in days (defaults to 365)
 * @param params.serialHex - Certificate serial number in hexadecimal format
 * @returns A jsrsasign Certificate object ready for encoding
 *
 * @example
 * ```typescript
 * const cert = createSelfSignedCertificate({
 *   subjectPublicJwk: { kty: 'EC', crv: 'P-256', x: '...', y: '...' },
 *   caPrivateJwk: { kty: 'EC', crv: 'P-256', d: '...' },
 *   digestAlgorithm: 'SHA-256',
 *   subject: 'Test User',
 *   validityDays: 30,
 *   serialHex: '01'
 * });
 * ```
 */
export const createSelfSignedCertificate = ({
  subjectPublicJwk,
  caPrivateJwk,
  digestAlgorithm = 'SHA-256',
  subject,
  validityDays = 365,
  serialHex,
}: CreateSelfSignedCertificateParams): KJUR.asn1.x509.Certificate => {
  const sbjpubkey = KEYUTIL.getKey(
    subjectPublicJwk as unknown as KJUR.jws.JWS.JsonWebKey
  );
  const cakey = KEYUTIL.getKey(
    caPrivateJwk as unknown as KJUR.jws.JWS.JsonWebKey
  );
  const dn = `/CN=${subject}`;
  const sigalg = digestAlgorithmToSigalg(digestAlgorithm);

  const now = new Date();
  const notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

  return new KJUR.asn1.x509.Certificate({
    version: 3,
    serial: { hex: serialHex },
    issuer: { str: dn },
    notbefore: toX509Time(now),
    notafter: toX509Time(notAfter),
    subject: { str: dn },
    sbjpubkey,
    ext: [
      { extname: 'basicConstraints', cA: false },
      { extname: 'keyUsage', critical: true, names: ['digitalSignature'] },
    ],
    sigalg,
    cakey,
  });
};
