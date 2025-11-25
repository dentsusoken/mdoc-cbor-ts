import { JwkMacAlgorithm } from '@/jwk/types';
import { MacAlgorithm } from './types';

/**
 * Mapping from COSE MAC algorithms to their corresponding digest algorithms.
 */
export const MAC_ALGORITHM_TO_DIGEST_ALGORITHM: Record<MacAlgorithm, string> = {
  [MacAlgorithm.HS256]: 'SHA-256',
  [MacAlgorithm.HS384]: 'SHA-384',
  [MacAlgorithm.HS512]: 'SHA-512',
};

/**
 * Mapping from JWK MAC algorithms to their corresponding digest algorithms.
 */
export const JWK_MAC_ALGORITHM_TO_DIGEST_ALGORITHM: Record<
  JwkMacAlgorithm,
  string
> = {
  [JwkMacAlgorithm.HS256]: 'SHA-256',
  [JwkMacAlgorithm.HS384]: 'SHA-384',
  [JwkMacAlgorithm.HS512]: 'SHA-512',
};

/**
 * Mapping from COSE MAC algorithms to their corresponding JWK MAC algorithms.
 */
export const MAC_ALGORITHM_TO_JWK_ALGORITHM: Record<
  MacAlgorithm,
  JwkMacAlgorithm
> = {
  [MacAlgorithm.HS256]: JwkMacAlgorithm.HS256,
  [MacAlgorithm.HS384]: JwkMacAlgorithm.HS384,
  [MacAlgorithm.HS512]: JwkMacAlgorithm.HS512,
};
