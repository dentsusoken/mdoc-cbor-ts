import { JwkCurves } from '@/jwk/types';
import { JwsAlgorithms } from './types';

/**
 * Maps JWK curve names to their corresponding JWS algorithm names
 * @description
 * A mapping from JSON Web Key (JWK) curve identifiers to their corresponding
 * JSON Web Signature (JWS) algorithm identifiers. This mapping supports NIST P-curves
 * and Edwards curves commonly used in cryptographic operations.
 */
export const JWK_CRV_TO_JWS_ALG: Record<JwkCurves, JwsAlgorithms | undefined> =
  {
    [JwkCurves.P256]: JwsAlgorithms.ES256,
    [JwkCurves.P384]: JwsAlgorithms.ES384,
    [JwkCurves.P521]: JwsAlgorithms.ES512,
    [JwkCurves.Ed25519]: JwsAlgorithms.EdDSA,
    [JwkCurves.Ed448]: JwsAlgorithms.EdDSA,
    [JwkCurves.X25519]: undefined, // X25519 is not used for signing
    [JwkCurves.X448]: undefined, // X448 is not used for signing
  };
