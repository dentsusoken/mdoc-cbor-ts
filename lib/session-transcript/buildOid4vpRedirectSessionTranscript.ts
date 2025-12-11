import { encodeCbor } from '@/cbor/codec';
import { JwkPublicKey } from '@/jwk/types';
import { SessionTranscript } from '@/mdoc/types';
import { sha256 } from '@noble/hashes/sha256';
import { computeJwkThumbprint } from 'noble-curves-extended';

/**
 * Parameters for building OpenID4VP redirect handover structures.
 */
interface BuildOid4vpRedirectHandoverInfoParams {
  /** The client_id request parameter. If applicable, this includes the Client Identifier Prefix. */
  clientId: string;
  /** The value of the nonce request parameter. */
  verifierNonce: string;
  /**
   * The Verifier's public key used to encrypt the response.
   * If the response is encrypted (e.g., using direct_post.jwt), this MUST be provided.
   * Otherwise, this MUST be null.
   */
  verifierJwkPublicKey: JwkPublicKey | null;
  /**
   * Either the redirect_uri or response_uri request parameter,
   * depending on which is present, as determined by the Response Mode.
   */
  responseUri: string;
}

/**
 * OpenID4VPHandoverInfo structure as defined in the specification.
 * MUST be an array: [clientId, nonce, jwkThumbprint, responseUri]
 *
 * @see OpenID4VP specification B.2.6.1
 */
type Oid4vpRedirectHandoverInfo = [
  string, // clientId
  string, // nonce
  Uint8Array | null, // jwkThumbprint
  string, // responseUri
];

/**
 * OpenID4VPHandover structure as defined in the specification.
 * Contains a fixed identifier and the SHA-256 hash of OpenID4VPHandoverInfo.
 *
 * @see OpenID4VP specification B.2.6.1
 */
type Oid4vpRedirectHandover = ['OpenID4VPHandover', Uint8Array];

/**
 * Builds the OpenID4VPHandoverInfo array structure.
 *
 * @description
 * Constructs the OpenID4VPHandoverInfo array as defined in the OpenID4VP specification B.2.6.1.
 * The array contains:
 * - clientId: The client_id request parameter
 * - nonce: The value of the nonce request parameter
 * - jwkThumbprint: The JWK SHA-256 Thumbprint (RFC7638) of the Verifier's public key,
 *   or null if the response is not encrypted
 * - responseUri: Either redirect_uri or response_uri request parameter
 *
 * @param params - Parameters for building the handover info
 * @returns The OpenID4VPHandoverInfo array structure
 *
 * @see OpenID4VP specification B.2.6.1
 */
export const buildOid4vpRedirectHandoverInfo = ({
  clientId,
  verifierNonce,
  verifierJwkPublicKey,
  responseUri,
}: BuildOid4vpRedirectHandoverInfoParams): Oid4vpRedirectHandoverInfo => {
  return [
    clientId,
    verifierNonce,
    verifierJwkPublicKey ? computeJwkThumbprint(verifierJwkPublicKey) : null,
    responseUri,
  ];
};

/**
 * Builds the OpenID4VPHandover structure.
 *
 * @description
 * Constructs the OpenID4VPHandover structure as defined in the OpenID4VP specification B.2.6.1.
 * The structure contains:
 * - A fixed identifier string "OpenID4VPHandover"
 * - The SHA-256 hash of the CBOR-encoded OpenID4VPHandoverInfo bytes
 *
 * @param params - Parameters for building the handover structure
 * @returns The OpenID4VPHandover structure
 *
 * @see OpenID4VP specification B.2.6.1
 */
export const buildOid4vpRedirectHandover = ({
  clientId,
  verifierNonce,
  verifierJwkPublicKey,
  responseUri,
}: BuildOid4vpRedirectHandoverInfoParams): Oid4vpRedirectHandover => {
  return [
    'OpenID4VPHandover',
    sha256(
      encodeCbor(
        buildOid4vpRedirectHandoverInfo({
          clientId,
          verifierNonce,
          verifierJwkPublicKey,
          responseUri,
        })
      )
    ),
  ];
};

/**
 * Builds the SessionTranscript structure for OpenID4VP redirect-based invocations.
 *
 * @description
 * Constructs the SessionTranscript CBOR structure as defined in ISO/IEC 18013-5 section 9.1.5.1,
 * with modifications for OpenID4VP redirect invocations as specified in OpenID4VP B.2.6.1.
 *
 * The structure contains:
 * - DeviceEngagementBytes: MUST be null for redirect invocations
 * - EReaderKeyBytes: MUST be null for redirect invocations
 * - Handover: The OpenID4VPHandover structure (array)
 *
 * @param params - Parameters for building the session transcript
 * @returns The SessionTranscript structure as a tuple
 *
 * @see ISO/IEC 18013-5 section 9.1.5.1
 * @see OpenID4VP specification B.2.6.1
 */
export const buildOid4vpRedirectSessionTranscript = ({
  clientId,
  verifierNonce,
  verifierJwkPublicKey,
  responseUri,
}: BuildOid4vpRedirectHandoverInfoParams): SessionTranscript => {
  return [
    null,
    null,
    buildOid4vpRedirectHandover({
      clientId,
      verifierNonce,
      verifierJwkPublicKey,
      responseUri,
    }),
  ];
};
