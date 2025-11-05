import { JwkPrivateKey, JwkPublicKey } from '@/jwk/types';
import { RandomBytes } from '@/types';
import { createIssuerSigned, IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { buildIssuerAuth } from '../mso/buildIssuerAuth';
import { buildIssuerNameSpaces } from './buildIssuerNameSpaces';

/**
 * Parameters for building an IssuerSigned structure.
 *
 * @description
 * These parameters are required to construct a complete IssuerSigned structure, which includes
 * both the issuer namespaces (with CBOR Tag 24 wrapped items) and the IssuerAuth (COSE_Sign1
 * signature over the Mobile Security Object).
 */
export type BuildIssuerSignedParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces and their associated elements as a map structure */
  nameSpaces: Map<string, Map<string, unknown>>;
  /** A cryptographically secure random bytes generator function */
  randomBytes: RandomBytes;
  /** The device's public key for authentication */
  deviceJwkPublicKey: JwkPublicKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: string;
  /** The date and time when the MSO was signed */
  signed: Date;
  /** The date and time when the document becomes valid */
  validFrom: Date;
  /** The date and time when the document expires */
  validUntil: Date;
  /** Optional date and time when the document should be updated */
  expectedUpdate?: Date;
  /** The issuer's X.509 certificate chain (single certificate or array) for COSE x5chain header */
  x5chain: Uint8Array | Uint8Array[];
  /** The issuer's private key (JWK) for signing COSE_Sign1 */
  issuerJwkPrivateKey: JwkPrivateKey;
};

export const buildIssuerSigned = ({
  docType,
  nameSpaces,
  randomBytes,
  deviceJwkPublicKey,
  digestAlgorithm,
  signed,
  validFrom,
  validUntil,
  expectedUpdate,
  x5chain,
  issuerJwkPrivateKey,
}: BuildIssuerSignedParams): IssuerSigned => {
  const issuerNameSpaces = buildIssuerNameSpaces(nameSpaces, randomBytes);
  const issuerAuth = buildIssuerAuth({
    docType,
    nameSpaces: issuerNameSpaces,
    deviceJwkPublicKey,
    digestAlgorithm,
    signed,
    validFrom,
    validUntil,
    expectedUpdate,
    x5chain,
    issuerJwkPrivateKey,
  });

  return createIssuerSigned([
    ['nameSpaces', issuerNameSpaces],
    ['issuerAuth', issuerAuth],
  ]);
};
