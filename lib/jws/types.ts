/**
 * JWS (JSON Web Signature) algorithms
 * Reference: https://tools.ietf.org/html/rfc7518#section-3.1
 */
export enum JwsAlgorithms {
  EdDSA = 'EdDSA',
  ES256 = 'ES256',
  ES384 = 'ES384',
  ES512 = 'ES512',
  PS256 = 'PS256',
  PS384 = 'PS384',
  PS512 = 'PS512',
  RS256 = 'RS256',
  RS384 = 'RS384',
  RS512 = 'RS512',
}
