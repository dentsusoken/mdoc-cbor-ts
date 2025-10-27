export type {
  JwkPublicKey,
  JwkPrivateKey,
  JwkBase,
} from 'noble-curves-extended';

/**
 * JSON Web Key (JWK) Octet Sequence Key for symmetric cryptographic operations.
 *
 * Represents a JWK "oct" (octet sequence) key, typically used for symmetric algorithms such as HMAC.
 * The value of 'k' is a base64url-encoded symmetric key.
 *
 * See RFC 7517, RFC 7518 sections 6.4 and 6.2.1.
 *
 * @example
 * const jwk: JwkOctKey = {
 *   kty: JwkKeyType.oct,
 *   alg: JwkMacAlgorithm.HS256,
 *   k: 'base64url-encoded-key',
 *   kid: 'key-id-1',
 *   key_ops: [JwkMacKeyOp.sign, JwkMacKeyOp.verify]
 * };
 *
 * @property {string} kty - Key Type. Value MUST be "oct" for symmetric keys.
 * @property {string} alg - Algorithm intended for use with the key (e.g., "HS256").
 * @property {string} k - Symmetric key encoded in base64url.
 * @property {string} [kid] - Optional key identifier.
 * @property {JwkMacKeyOp[]} [key_ops] - Optional list of permitted key operations.
 */
export interface JwkOctKey {
  kty: string;
  alg: string;
  k: string;
  kid?: string;
  key_ops?: JwkMacKeyOp[];
}

/**
 * Enumeration of supported JWK (JSON Web Key) curve names.
 *
 * @description
 * Lists the allowed 'crv' (curve) values recognized for EC (Elliptic Curve) and OKP (Octet Key Pair) JWKs.
 * These identifiers are used in the 'crv' member of JWK objects as defined by relevant RFCs and IANA registries.
 *
 * - For "EC" keys: "P-256", "P-384", "P-521" (NIST curves)
 * - For "OKP" keys: "Ed25519", "Ed448"
 *
 * @example
 * ```typescript
 * const publicKey = {
 *   kty: JwkKeyType.EC,
 *   crv: JwkCurve.P256,
 *   x: 'base64urlX',
 *   y: 'base64urlY',
 * };
 *
 * const okpKey = {
 *   kty: JwkKeyType.OKP,
 *   crv: JwkCurve.Ed25519,
 *   x: 'base64urlPublicKey',
 * };
 * ```
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7518#section-6.2.1.1 | RFC 7518 Section 6.2.1.1}
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-curve-names | IANA JOSE Curve Names}
 */
export enum JwkCurve {
  /** NIST P-256 elliptic curve (secp256r1) */
  P256 = 'P-256',
  /** NIST P-384 elliptic curve (secp384r1) */
  P384 = 'P-384',
  /** NIST P-521 elliptic curve (secp521r1) */
  P521 = 'P-521',
  /** Edwards-curve Ed25519 (for use with OKP keys/EdDSA) */
  Ed25519 = 'Ed25519',
  /** Edwards-curve Ed448 (for use with OKP keys/EdDSA) */
  Ed448 = 'Ed448',
  /** X25519 elliptic curve (for use with OKP keys/ECDH-ES) */
  X25519 = 'X25519',
  /** X448 elliptic curve (for use with OKP keys/ECDH-ES) */
  X448 = 'X448',
}

/**
 * Enumeration of supported JWK (JSON Web Key) types.
 *
 * @description
 * Specifies the valid 'kty' (key type) values as defined in the JSON Web Key (JWK) standard.
 * These values indicate the cryptographic system applicable to the key, such as elliptic curve, symmetric, or octet key pair (for EdDSA/X25519/X448).
 *
 * - {@link JwkKeyType.OKP}: "OKP" – Octet Key Pair, for EdDSA or X25519/X448 keys.
 * - {@link JwkKeyType.EC}: "EC" – Elliptic Curve, for ECDSA/ECDH using NIST curves.
 * - {@link JwkKeyType.oct}: "oct" – Octet sequence, for symmetric keys (e.g., HMAC or AES).
 *
 * These types are used in the 'kty' member of a JWK object.
 *
 * @example
 * ```typescript
 * const jwk = { kty: JwkKeyType.EC, crv: "P-256", x: "...", y: "..." };
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1 | RFC 7517 Section 4.1}
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-types | IANA JOSE Key Types}
 */
export enum JwkKeyType {
  /** Octet Key Pair - Used for EdDSA and ECDH-ES with Curve25519/Curve448 */
  OKP = 'OKP',
  /** Elliptic Curve - Used for ECDSA and ECDH-ES with NIST curves */
  EC = 'EC',
  /** Octet sequence - Used for symmetric keys (HMAC, AES, etc.) */
  oct = 'oct',
}

/**
 * Enumeration of standard JWK (JSON Web Key) property names as defined in RFC 7517/7518.
 *
 * @description
 * Enumerates the canonical property keys used in JWK objects for describing cryptographic material.
 * These string identifiers correspond to the members used in representing keys for various algorithms and use cases.
 *
 * - {@link JwkKey.KeyType}: "kty" – Key Type; identifies the cryptographic system family of the key (e.g., "EC", "OKP", "oct").
 * - {@link JwkKey.KeyID}: "kid" – Key ID; application-specific identifier for the key.
 * - {@link JwkKey.Algorithm}: "alg" – Algorithm intended to be used with this key.
 * - {@link JwkKey.KeyOps}: "key_ops" – Array of allowed key operations (see {@link JwkKeyOp}).
 * - {@link JwkKey.Curve}: "crv" – Curve used for EC and OKP keys.
 * - {@link JwkKey.x}: "x" – The x-coordinate (for EC keys) or public key value (for OKP keys) encoded in base64url.
 * - {@link JwkKey.y}: "y" – y-coordinate (for EC keys); not present for OKP keys.
 * - {@link JwkKey.d}: "d" – Private key value (for EC and OKP) in base64url.
 * - {@link JwkKey.k}: "k" – Symmetric key value (for keys of type "oct") in base64url.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7517#section-4 | RFC 7517 JWK Members}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7518#section-6.2 | RFC 7518 JWK Elliptic Curve}
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-properties}
 */
export enum JwkKey {
  /** "kty" – Key Type identifier */
  KeyType = 'kty',
  /** "kid" – Key Identifier */
  KeyID = 'kid',
  /** "alg" – Algorithm identifier */
  Algorithm = 'alg',
  /** "key_ops" – Key operations */
  KeyOps = 'key_ops',
  /** "crv" – Curve identifier for EC and OKP keys */
  Curve = 'crv',
  /** "x" – x-coordinate for EC keys or public key for OKP keys */
  x = 'x',
  /** "y" – y-coordinate for EC keys */
  y = 'y',
  /** "d" – Private key component for EC and OKP keys */
  d = 'd',
  /** "k" – Symmetric key value */
  k = 'k',
}

/**
 * Enumeration of standard JWK (JSON Web Key) key operations as defined in RFC 7517/7518.
 *
 * @description
 * Enumerates the key operation identifiers that can appear in the `key_ops` member of a JWK.
 * These strings indicate the intended cryptographic usages for the key, such as signing, verification,
 * encryption, decryption, etc.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7517#section-4.3 | RFC 7517 Section 4.3 - "key_ops" (Key Operations) Parameter}
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-operations}
 */
export enum JwkKeyOp {
  /** "sign" – Compute digital signature or MAC */
  Sign = 'sign',
  /** "verify" – Verify digital signature or MAC */
  Verify = 'verify',
  /** "encrypt" – Encrypt content */
  Encrypt = 'encrypt',
  /** "decrypt" – Decrypt content and validate decryption, if applicable */
  Decrypt = 'decrypt',
  /** "wrapKey" – Encrypt key (wrap key) */
  WrapKey = 'wrapKey',
  /** "unwrapKey" – Decrypt key and validate decryption (unwrap key) */
  UnwrapKey = 'unwrapKey',
  /** "deriveKey" – Derive key using this key */
  DeriveKey = 'deriveKey',
  /** "deriveBits" – Derive bits not to be used as a key */
  DeriveBits = 'deriveBits',
}

/**
 * Enumeration of JWK (JSON Web Key) MAC key operations.
 *
 * @description
 * Enumerates the MAC key operation identifiers, mapped to the underlying JWK key operations.
 * Used to specify the intended cryptographic usages for MAC keys in JWK.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7517#section-4.3 | RFC 7517 Section 4.3 - "key_ops" (Key Operations) Parameter}
 * @see JwkKeyOp
 */
export enum JwkMacKeyOp {
  /** Generate MAC (mapped to 'sign' operation) */
  MACCreate = 'sign',
  /** Verify MAC (mapped to 'verify' operation) */
  MACVerify = 'verify',
}

/**
 * Enumeration of JWK (JSON Web Key) digital signature algorithms.
 *
 * @description
 * Lists the algorithm identifiers used within a JWK's `"alg"` member for digital signature operations.
 * These correspond to signature algorithms supported by the JWA (JSON Web Algorithms) specification.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7518#section-3.1 | RFC 7518 - JSON Web Algorithms (JWA) "alg" (Algorithm) Parameter}
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms | IANA JOSE Algorithms Registry}
 */
export enum JwkAlgorithm {
  /** "EdDSA" – Edwards-curve Digital Signature Algorithm */
  EdDSA = 'EdDSA',
  /** "ES256" – ECDSA using P-256 curve and SHA-256 */
  ES256 = 'ES256',
  /** "ES384" – ECDSA using P-384 curve and SHA-384 */
  ES384 = 'ES384',
  /** "ES512" – ECDSA using P-521 curve and SHA-512 */
  ES512 = 'ES512',
}

/**
 * Enumeration of JWK (JSON Web Key) MAC algorithms.
 *
 * @description
 * Lists the algorithm identifiers used within a JWK's `"alg"` member for Message Authentication Code (MAC) operations.
 * These correspond to HMAC algorithms supported by the JWA (JSON Web Algorithms) specification.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7518#section-3.1 | RFC 7518 - JSON Web Algorithms (JWA) "alg" (Algorithm) Parameter}
 * @see {@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms | IANA JOSE Algorithms Registry}
 */
export enum JwkMacAlgorithm {
  /** "HS256" – HMAC using SHA-256 */
  HS256 = 'HS256',
  /** "HS384" – HMAC using SHA-384 */
  HS384 = 'HS384',
  /** "HS512" – HMAC using SHA-512 */
  HS512 = 'HS512',
}
