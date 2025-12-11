import { encodeCbor } from '@/cbor/codec';
import { JwkPublicKey } from '@/jwk/types';
import { SessionTranscript } from '@/mdoc/types';
import { sha256 } from '@noble/hashes/sha256';
import { computeJwkThumbprint } from 'noble-curves-extended';

/**
 * Parameters for building OpenID4VP DCAPI handover structures.
 */
interface BuildOid4vpDcapiHandoverInfoParams {
  /**
   * The string representing the Origin of the request as described in Appendix A.2.
   * It MUST NOT be prefixed with "origin:".
   */
  verifierOrigin: string;
  /** The value of the nonce request parameter. */
  verifierNonce: string;
  /**
   * The Verifier's public key used to encrypt the response.
   * For Response Mode dc_api.jwt, this MUST be provided.
   * For Response Mode dc_api, this MUST be null.
   */
  verifierJwkPublicKey: JwkPublicKey | null;
}

/**
 * OpenID4VPDCAPIHandoverInfo structure as defined in the specification.
 * MUST be an array: [origin, nonce, jwkThumbprint]
 *
 * @see OpenID4VP specification B.2.6.2
 */
type Oid4vpDcapiHandoverInfo = [
  string, // origin
  string, // nonce
  Uint8Array | null, // jwkThumbprint
];

/**
 * OpenID4VPDCAPIHandover structure as defined in the specification.
 * Contains a fixed identifier and the SHA-256 hash of OpenID4VPDCAPIHandoverInfo.
 *
 * @see OpenID4VP specification B.2.6.2
 */
type Oid4vpDcapiHandover = ['OpenID4VPDCAPIHandover', Uint8Array];

/**
 * Builds the OpenID4VPDCAPIHandoverInfo array structure.
 *
 * @description
 * Constructs the OpenID4VPDCAPIHandoverInfo array as defined in the OpenID4VP specification B.2.6.2.
 * The array contains:
 * - origin: The string representing the Origin of the request (MUST NOT be prefixed with "origin:")
 * - nonce: The value of the nonce request parameter
 * - jwkThumbprint: The JWK SHA-256 Thumbprint (RFC7638) of the Verifier's public key,
 *   or null if Response Mode is dc_api (not dc_api.jwt)
 *
 * @param params - Parameters for building the handover info
 * @returns The OpenID4VPDCAPIHandoverInfo array structure
 *
 * @see OpenID4VP specification B.2.6.2
 */
export const buildOid4vpDcapiHandoverInfo = ({
  verifierOrigin,
  verifierNonce,
  verifierJwkPublicKey,
}: BuildOid4vpDcapiHandoverInfoParams): Oid4vpDcapiHandoverInfo => {
  return [
    verifierOrigin,
    verifierNonce,
    verifierJwkPublicKey ? computeJwkThumbprint(verifierJwkPublicKey) : null,
  ];
};

/**
 * Builds the OpenID4VPDCAPIHandover structure.
 *
 * @description
 * Constructs the OpenID4VPDCAPIHandover structure as defined in the OpenID4VP specification B.2.6.2.
 * The structure contains:
 * - A fixed identifier string "OpenID4VPDCAPIHandover"
 * - The SHA-256 hash of the CBOR-encoded OpenID4VPDCAPIHandoverInfo bytes
 *
 * @param params - Parameters for building the handover structure
 * @returns The OpenID4VPDCAPIHandover structure
 *
 * @see OpenID4VP specification B.2.6.2
 */
export const buildOid4vpDcapiHandover = ({
  verifierOrigin,
  verifierNonce,
  verifierJwkPublicKey,
}: BuildOid4vpDcapiHandoverInfoParams): Oid4vpDcapiHandover => {
  return [
    'OpenID4VPDCAPIHandover',
    sha256(
      encodeCbor(
        buildOid4vpDcapiHandoverInfo({
          verifierOrigin,
          verifierNonce,
          verifierJwkPublicKey,
        })
      )
    ),
  ];
};

/**
 * Builds the SessionTranscript structure for OpenID4VP DCAPI-based invocations.
 *
 * @description
 * Constructs the SessionTranscript CBOR structure as defined in ISO/IEC 18013-5 section 9.1.5.1,
 * with modifications for OpenID4VP DCAPI invocations as specified in OpenID4VP B.2.6.2.
 *
 * The structure contains:
 * - DeviceEngagementBytes: MUST be null for DCAPI invocations
 * - EReaderKeyBytes: MUST be null for DCAPI invocations
 * - Handover: The OpenID4VPDCAPIHandover structure (array)
 *
 * @param params - Parameters for building the session transcript
 * @returns The SessionTranscript structure as a tuple
 *
 * @see ISO/IEC 18013-5 section 9.1.5.1
 * @see OpenID4VP specification B.2.6.2
 */
export const buildOid4vpDcapiSessionTranscript = ({
  verifierOrigin,
  verifierNonce,
  verifierJwkPublicKey,
}: BuildOid4vpDcapiHandoverInfoParams): SessionTranscript => {
  return [
    null,
    null,
    buildOid4vpDcapiHandover({
      verifierOrigin,
      verifierNonce,
      verifierJwkPublicKey,
    }),
  ];
};
