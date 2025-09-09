import { KJUR } from 'jsrsasign';
import type { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';

type SubjectAttrs = {
  commonName?: string;
  countryName?: string;
  stateOrProvinceName?: string;
  localityName?: string;
  organizationName?: string;
  organizationalUnitName?: string;
};

type CreateSelfSignedCertificateParams = {
  /** Subject public key in PEM (SPKI) or jsrsasign key object */
  publicKeyPem: string;
  /** Issuer private key in PEM (PKCS#8) or jsrsasign key object */
  privateKeyPem: string;
  /** Message digest algorithm for certificate signature. Defaults to 'SHA-256'. */
  digestAlgorithm?: DigestAlgorithm;
  /** Subject attributes; issuer will be the same (self-signed). */
  subject?: SubjectAttrs;
  /** Validity in days (default: 365). */
  validityDays?: number;
  /** Optional serial number (hex string without 0x). If omitted a random one is generated. */
  serialNumberHex?: string;
  /** Random byte generator used for serial number, etc. */
  randomBytes: (numBytes: number) => Uint8Array;
};

const toDNString = (subject?: SubjectAttrs): string => {
  const parts: string[] = [];
  const cn = subject?.commonName ?? 'Self-Signed';
  parts.push(`CN=${cn}`);
  if (subject?.countryName) parts.push(`C=${subject.countryName}`);
  if (subject?.stateOrProvinceName)
    parts.push(`ST=${subject.stateOrProvinceName}`);
  if (subject?.localityName) parts.push(`L=${subject.localityName}`);
  if (subject?.organizationName) parts.push(`O=${subject.organizationName}`);
  if (subject?.organizationalUnitName)
    parts.push(`OU=${subject.organizationalUnitName}`);
  return `/${parts.join('/')}`;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const mapDigestToSigAlg = (digest: DigestAlgorithm): string => {
  switch (digest) {
    case 'SHA-384':
      return 'SHA384withECDSA';
    case 'SHA-512':
      return 'SHA512withECDSA';
    case 'SHA-256':
    default:
      return 'SHA256withECDSA';
  }
};

const toZulu = (d: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const MM = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}Z`;
};

/**
 * Creates a self-signed X.509 certificate from provided JWK keys.
 * @description
 * Builds and signs an X.509 v3 certificate using node-forge (pure JS; no WebCrypto).
 * Subject equals issuer (self-signed). Minimal extensions are included.
 * Randomness is injected via the provided randomBytes function.
 *
 * @param params - Configuration including JWK keys, subject, validity and RNG
 * @returns PEM-encoded certificate string (BEGIN CERTIFICATE)
 */
export const createSelfSignedCertificate = (
  params: CreateSelfSignedCertificateParams
): string => {
  const {
    publicKeyPem,
    privateKeyPem,
    digestAlgorithm: signatureDigest = 'SHA-256',
    subject,
    validityDays = 365,
    serialNumberHex,
    randomBytes,
  } = params;

  const serialHex = serialNumberHex ?? bytesToHex(randomBytes(16));
  const dn = toDNString(subject);
  const sigalg = mapDigestToSigAlg(signatureDigest);

  const now = new Date();
  const notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

  const x509 = new KJUR.asn1.x509.Certificate({
    version: 3,
    serial: { hex: serialHex },
    issuer: { str: dn },
    notbefore: toZulu(now),
    notafter: toZulu(notAfter),
    subject: { str: dn },
    sbjpubkey: publicKeyPem,
    ext: [
      { extname: 'basicConstraints', cA: false },
      { extname: 'keyUsage', critical: true, names: ['digitalSignature'] },
    ],
    sigalg,
    cakey: privateKeyPem,
  });

  return x509.getPEM();
};
