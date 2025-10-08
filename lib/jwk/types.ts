export type {
  JwkPublicKey,
  JwkPrivateKey,
  JwkBase,
} from 'noble-curves-extended';

/**
 * JWK (JSON Web Key) curve names
 * Reference: https://tools.ietf.org/html/rfc7518#section-6.2.1
 */
export enum JwkCurves {
  P256 = 'P-256',
  P384 = 'P-384',
  P521 = 'P-521',
  Ed25519 = 'Ed25519',
  Ed448 = 'Ed448',
}

/**
 * JWK (JSON Web Key) key types
 * @description
 * Enumeration of key types supported in JSON Web Key format as defined in RFC 7517.
 * These values are used in the 'kty' (key type) parameter to identify the cryptographic
 * algorithm family used with the key.
 *
 * @example
 * ```typescript
 * // Elliptic Curve key
 * const ecKey = {
 *   kty: JwkKeyTypes.EC,
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 * };
 *
 * // Octet Key Pair (for EdDSA)
 * const okpKey = {
 *   kty: JwkKeyTypes.OKP,
 *   crv: 'Ed25519',
 *   x: 'base64url-encoded-public-key'
 * };
 *
 * // Symmetric key
 * const octKey = {
 *   kty: JwkKeyTypes.oct,
 *   k: 'base64url-encoded-key-value'
 * };
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - RFC 7517 Key Type Parameter
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-types} - IANA JSON Web Key Types registry
 */
export enum JwkKeyTypes {
  /** Octet Key Pair - Used for EdDSA and ECDH-ES with Curve25519/Curve448 */
  OKP = 'OKP',
  /** Elliptic Curve - Used for ECDSA and ECDH-ES with NIST curves */
  EC = 'EC',
  /** Octet sequence - Used for symmetric keys (HMAC, AES, etc.) */
  oct = 'oct',
}

/**
 * JWK (JSON Web Key) key parameters registered in the IANA "JSON Web Key Parameters" registry.
 * @description
 * Enumeration of key parameters used in JSON Web Key objects. These string identifiers
 * specify the various components and metadata of cryptographic keys in JWK format.
 * These parameters correspond to the standard JWK fields defined in RFC 7517.
 *
 * @example
 * ```typescript
 * // Create a JWK with common parameters
 * const jwk = {
 *   [JwkKeyParams.KeyType]: JwkKeyTypes.EC,        // kty: key type
 *   [JwkKeyParams.KeyID]: 'my-key-id',             // kid: key identifier
 *   [JwkKeyParams.Algorithm]: JwkAlgorithms.ES256, // alg: algorithm
 *   [JwkKeyParams.Curve]: JwkCurves.P256,          // crv: curve
 *   [JwkKeyParams.x]: 'base64url-x-coord',         // x: x-coordinate
 *   [JwkKeyParams.y]: 'base64url-y-coord'          // y: y-coordinate
 * };
 *
 * // Access key parameters
 * const keyType = jwk[JwkKeyParams.KeyType];
 * const curve = jwk[JwkKeyParams.Curve];
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4} - RFC 7517 JWK Parameters
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-parameters} - IANA JSON Web Key Parameters registry
 * @see {@link JwkKeyTypes} - JWK key types
 */
export enum JwkKeyParams {
  /** Key type identifier */
  KeyType = 'kty',
  /** Key identifier */
  KeyID = 'kid',
  /** Algorithm identifier */
  Algorithm = 'alg',
  /** Key operations */
  KeyOps = 'key_ops',
  /** Curve identifier for EC and OKP keys */
  Curve = 'crv',
  /** x-coordinate for EC keys or public key for OKP keys */
  x = 'x',
  /** y-coordinate for EC keys */
  y = 'y',
  /** Private key component for EC and OKP keys */
  d = 'd',
  /** Symmetric key value */
  k = 'k',
}

/**
 * JWK (JSON Web Key) key operations registered in the IANA "JSON Web Key Operations" registry.
 * @description
 * Enumeration of key operations that specify the intended use of a cryptographic key
 * in JWK operations. These string identifiers indicate what operations are permitted
 * or intended for a particular key, helping to enforce proper key usage and security policies.
 *
 * @example
 * ```typescript
 * // Create a JWK with specific operations
 * const signingKey = {
 *   kty: JwkKeyTypes.EC,
 *   key_ops: [JwkKeyOps.Sign], // Only allow signing
 *   crv: JwkCurves.P256
 * };
 *
 * // Key for both encryption and decryption
 * const encryptionKey = {
 *   kty: JwkKeyTypes.oct,
 *   key_ops: [JwkKeyOps.Encrypt, JwkKeyOps.Decrypt],
 *   k: 'base64url-encoded-key'
 * };
 *
 * // Check if key supports specific operation
 * const operations = jwk.key_ops;
 * const canSign = operations?.includes(JwkKeyOps.Sign);
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.3} - RFC 7517 Key Operations Parameter
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-operations} - IANA JSON Web Key Operations registry
 * @see {@link JwkKeyParams.KeyOps} - Key operations parameter
 */
export enum JwkKeyOps {
  /** Compute digital signature */
  Sign = 'sign',
  /** Verify digital signature */
  Verify = 'verify',
  /** Encrypt content */
  Encrypt = 'encrypt',
  /** Decrypt content */
  Decrypt = 'decrypt',
  /** Encrypt key */
  WrapKey = 'wrapKey',
  /** Decrypt key */
  UnwrapKey = 'unwrapKey',
  /** Derive key */
  DeriveKey = 'deriveKey',
  /** Derive bits not to be used as a key */
  DeriveBits = 'deriveBits',
}

/**
 * JWK (JSON Web Key) algorithms
 * @description
 * Enumeration of cryptographic algorithms supported in JSON Web Key format.
 * These algorithms are used in the 'alg' (algorithm) parameter to specify
 * which cryptographic algorithm should be used with the key. This covers
 * both JWS (JSON Web Signature) and JWE (JSON Web Encryption) algorithms.
 *
 * @example
 * ```typescript
 * // Create a JWK with specific algorithm
 * const signingKey = {
 *   kty: JwkKeyTypes.EC,
 *   alg: JwkAlgorithms.ES256,
 *   crv: JwkCurves.P256,
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 * };
 *
 * // Use for JWS operations
 * const jwsHeader = { alg: JwkAlgorithms.ES256 };
 *
 * // Use for JWE operations
 * const jweHeader = { alg: JwkAlgorithms.RSA_OAEP, enc: 'A256GCM' };
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.4} - RFC 7517 Algorithm Parameter
 * @see {@link https://tools.ietf.org/html/rfc7518#section-3.1} - RFC 7518 JWS Algorithms
 * @see {@link https://tools.ietf.org/html/rfc7518#section-4.1} - RFC 7518 JWE Algorithms
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms} - IANA JOSE Algorithms registry
 */
export enum JwkAlgorithms {
  // Digital Signature Algorithms
  /** EdDSA signature algorithm */
  EdDSA = 'EdDSA',
  /** ECDSA using P-256 curve and SHA-256 */
  ES256 = 'ES256',
  /** ECDSA using P-384 curve and SHA-384 */
  ES384 = 'ES384',
  /** ECDSA using P-521 curve and SHA-512 */
  ES512 = 'ES512',
}

/**
 * JWK (JSON Web Key) MAC algorithms
 * @description
 * Enumeration of HMAC-based algorithms supported in JSON Web Key format.
 * These algorithms are used in the 'alg' (algorithm) parameter to specify
 * which HMAC algorithm should be used with the key for message authentication codes (MAC).
 *
 * @example
 * ```typescript
 * // Create a JWK with a specific MAC algorithm
 * const macKey = {
 *   kty: JwkKeyTypes.oct,
 *   alg: JwkMacAlgorithms.HS256,
 *   k: 'base64url-encoded-symmetric-key'
 * };
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7518#section-3.2} - RFC 7518 JWS MAC Algorithms
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms} - IANA JOSE Algorithms registry
 */
export enum JwkMacAlgorithms {
  /** HMAC using SHA-256 */
  HS256 = 'HS256',
  /** HMAC using SHA-384 */
  HS384 = 'HS384',
  /** HMAC using SHA-512 */
  HS512 = 'HS512',
}

/**
 * JWK (JSON Web Key) MAC operations mapping.
 * @description
 * Enumeration that maps MAC-specific operations to their corresponding JWK key operations.
 * In JWK, MAC creation and verification are represented using the same operation names
 * as digital signatures ('sign' and 'verify'), but are used in the context of symmetric
 * key operations for message authentication codes.
 *
 * @example
 * ```typescript
 * // Create a symmetric key for MAC operations
 * const macKey = {
 *   kty: JwkKeyTypes.oct,
 *   key_ops: [JwkMacKeyOps.MACCreate, JwkMacKeyOps.MACVerify],
 *   k: 'base64url-encoded-symmetric-key'
 * };
 *
 * // Check MAC capabilities
 * const canCreateMAC = macKey.key_ops?.includes(JwkMacKeyOps.MACCreate);
 * const canVerifyMAC = macKey.key_ops?.includes(JwkMacKeyOps.MACVerify);
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.3} - RFC 7517 Key Operations Parameter
 * @see {@link JwkKeyOps} - Standard JWK key operations
 */
export enum JwkMacKeyOps {
  /** Generate MAC (mapped to 'sign' operation) */
  MACCreate = 'sign',
  /** Verify MAC (mapped to 'verify' operation) */
  MACVerify = 'verify',
}

/**
 * JWK (JSON Web Key) Octet Sequence Key type
 * @description
 * Represents a symmetric key in JWK format, typically used for HMAC or other symmetric cryptographic operations.
 *
 * @property {string} kty - Key type, must be "oct" for octet sequence keys.
 * @property {string} alg - Algorithm intended for use with the key (e.g., "HS256").
 * @property {string} k - The symmetric key, encoded in base64url format.
 * @property {string} [kid] - Optional key identifier.
 * @property {string[]} [key_ops] - Optional list of permitted key operations (e.g., "sign", "verify").
 *
 * @example
 * ```typescript
 * const octKey: JwkOctKey = {
 *   kty: "oct",
 *   alg: "HS256",
 *   k: "base64url-encoded-key",
 *   kid: "my-key-id",
 *   key_ops: ["sign", "verify"]
 * };
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7517#section-6.4} - RFC 7517 Octet Sequence Keys
 */
export type JwkOctKey = {
  kty: string;
  alg: string;
  k: string;
  kid?: string;
  key_ops?: string[];
};
