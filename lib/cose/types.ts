/**
 * COSE Header labels registered in the IANA "COSE Header Parameters" registry.
 * Reference: https://www.iana.org/assignments/cose/cose.xhtml#header-parameters
 */
export enum Headers {
  Algorithm = 1,
  Critical = 2,
  ContentType = 3,
  KeyId = 4,
  IV = 5,
  PartialIV = 6,
  CounterSignature = 7,
  CounterSignature0 = 9,
  CounterSignatureV2 = 11,
  CounterSignature0V2 = 12,
  X5Bag = 32,
  X5Chain = 33,
  X5T = 34,
  X5U = 35,
}

/**
 * COSE Algorithm identifiers registered in the IANA "COSE Algorithms" registry.
 * @description
 * Enumeration of cryptographic algorithms used in COSE (CBOR Object Signing and Encryption)
 * operations. These numeric identifiers are used in COSE headers to specify which algorithm
 * should be used for signing, verification, or other cryptographic operations.
 *
 * @example
 * ```typescript
 * // Use in COSE protected headers
 * const protectedHeaders = new Map([[Headers.Algorithm, Algorithms.ES256]]);
 *
 * // Algorithm selection for signing
 * const algorithm = Algorithms.EdDSA; // -8
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 * @see {@link Headers.Algorithm} - Algorithm header parameter
 */
export enum Algorithms {
  /** EdDSA signature algorithms */
  EdDSA = -8,
  /** ECDSA using P-256 curve and SHA-256 */
  ES256 = -7,
  /** ECDSA using P-384 curve and SHA-384 */
  ES384 = -35,
  /** ECDSA using P-521 curve and SHA-512 */
  ES512 = -36,
}

/**
 * COSE MAC (Message Authentication Code) Algorithm identifiers.
 * @description
 * Enumeration of MAC algorithms used in COSE operations for message authentication.
 * These algorithms provide data integrity and authenticity verification using symmetric keys.
 *
 * @example
 * ```typescript
 * // Use HMAC with SHA-256
 * const macAlgorithm = MacAlgorithms.HS256; // 5
 *
 * // Use in COSE MAC operations
 * const protectedHeaders = new Map([[Headers.Algorithm, MacAlgorithms.HS384]]);
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 */
export enum MacAlgorithms {
  /** HMAC using SHA-256 */
  HS256 = 5,
  /** HMAC using SHA-384 */
  HS384 = 6,
  /** HMAC using SHA-512 */
  HS512 = 7,
}

/**
 * COSE Encryption Algorithm identifiers.
 * @description
 * Enumeration of encryption algorithms used in COSE operations for data confidentiality.
 * These algorithms provide authenticated encryption with associated data (AEAD).
 *
 * @example
 * ```typescript
 * // Use AES-256-GCM encryption
 * const encAlgorithm = EncryptionAlgorithms.A256GCM; // 3
 *
 * // Direct key agreement (no key wrapping)
 * const directAlgorithm = EncryptionAlgorithms.Direct; // -6
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 */
export enum EncryptionAlgorithms {
  /** AES-GCM mode with 128-bit key */
  A128GCM = 1,
  /** AES-GCM mode with 192-bit key */
  A192GCM = 2,
  /** AES-GCM mode with 256-bit key */
  A256GCM = 3,
  /** Direct use of CEK (Content Encryption Key) */
  Direct = -6,
}

/**
 * COSE Key Type identifiers registered in the IANA "COSE Key Types" registry.
 * @description
 * Enumeration of key types used in COSE operations. These numeric identifiers specify
 * the family of cryptographic algorithms that the key can be used with.
 *
 * @example
 * ```typescript
 * // Elliptic Curve key type
 * const keyType = KeyTypes.EC; // 2
 *
 * // Use in COSE key construction
 * const coseKey = new Map([[1, KeyTypes.EC]]); // kty parameter
 *
 * // Octet Key Pair for EdDSA
 * const okpKeyType = KeyTypes.OKP; // 1
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 */
export enum KeyTypes {
  /** Octet Key Pair - Used for EdDSA and ECDH-ES with Curve25519/Curve448 */
  OKP = 1,
  /** Elliptic Curve - Used for ECDSA and ECDH-ES with NIST curves */
  EC = 2,
  /** Octet sequence - Used for symmetric keys */
  oct = 4,
}

/**
 * COSE Elliptic Curve identifiers registered in the IANA "COSE Elliptic Curves" registry.
 * @description
 * Enumeration of elliptic curves used in COSE cryptographic operations. These numeric
 * identifiers specify which elliptic curve should be used with EC and OKP key types.
 *
 * @example
 * ```typescript
 * // Use P-256 curve for ECDSA
 * const curve = Curve.P256; // 1
 *
 * // Use Ed25519 curve for EdDSA
 * const edCurve = Curve.Ed25519; // 6
 *
 * // Use in COSE key construction
 * const coseKey = new Map([
 *   [1, KeyTypes.EC],        // kty
 *   [-1, Curve.P256]         // crv
 * ]);
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#elliptic-curves} - IANA COSE Elliptic Curves registry
 * @see {@link KeyTypes.EC} - Elliptic Curve key type
 * @see {@link KeyTypes.OKP} - Octet Key Pair type
 */
export enum Curves {
  /** NIST P-256 curve (secp256r1) */
  P256 = 1,
  /** NIST P-384 curve (secp384r1) */
  P384 = 2,
  /** NIST P-521 curve (secp521r1) */
  P521 = 3,
  /** Ed25519 for EdDSA */
  Ed25519 = 6,
  /** Ed448 for EdDSA */
  Ed448 = 7,
}

/**
 * COSE Key Common Parameters registered in the IANA "COSE Key Common Parameters" registry.
 * @description
 * Enumeration of key parameters used in COSE key objects. These numeric identifiers
 * specify the various components and metadata of cryptographic keys in COSE format.
 * Positive values are used for common parameters while negative values are used for
 * algorithm-specific parameters.
 *
 * @example
 * ```typescript
 * // Create a COSE key with common parameters
 * const coseKey = new Map([
 *   [KeyParams.KeyType, KeyTypes.EC],     // kty: key type
 *   [KeyParams.KeyID, keyIdBytes],        // kid: key identifier
 *   [KeyParams.Algorithm, Algorithms.ES256], // alg: algorithm
 *   [KeyParams.Curve, Curves.P256],       // crv: curve
 *   [KeyParams.x, xCoordinate],           // x: x-coordinate
 *   [KeyParams.y, yCoordinate]            // y: y-coordinate
 * ]);
 *
 * // Access key parameters
 * const keyType = coseKey.get(KeyParams.KeyType);
 * const curve = coseKey.get(KeyParams.Curve);
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-common-parameters} - IANA COSE Key Common Parameters registry
 * @see {@link KeyTypes} - COSE key types
 * @see {@link Algorithms} - COSE algorithms
 * @see {@link Curves} - COSE elliptic curves
 */
export enum KeyParams {
  /** Key type identifier */
  KeyType = 1,
  /** Key identifier */
  KeyId = 2,
  /** Algorithm identifier */
  Algorithm = 3,
  /** Key operations */
  KeyOps = 4,
  /** Curve identifier for EC and OKP keys */
  Curve = -1,
  /** x-coordinate for EC keys or public key for OKP keys */
  x = -2,
  /** y-coordinate for EC keys */
  y = -3,
  /** Private key component for EC and OKP keys */
  d = -4,
  /** Symmetric key value */
  k = -1,
}

/**
 * COSE Key Operations registered in the IANA "COSE Key Operations" registry.
 * @description
 * Enumeration of key operations that specify the intended use of a cryptographic key
 * in COSE operations. These numeric identifiers indicate what operations are permitted
 * or intended for a particular key, helping to enforce proper key usage and security policies.
 *
 * @example
 * ```typescript
 * // Create a COSE key with specific operations
 * const signingKey = new Map([
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.KeyOps, [KeyOps.Sign]], // Only allow signing
 *   [KeyParams.Curve, Curves.P256]
 * ]);
 *
 * // Key for both encryption and decryption
 * const encryptionKey = new Map([
 *   [KeyParams.KeyType, KeyTypes.OCT],
 *   [KeyParams.KeyOps, [KeyOps.Encrypt, KeyOps.Decrypt]],
 *   [KeyParams.k, symmetricKeyBytes]
 * ]);
 *
 * // Check if key supports specific operation
 * const operations = coseKey.get(KeyParams.KeyOps);
 * const canSign = operations?.includes(KeyOps.Sign);
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-ops} - IANA COSE Key Operations registry
 * @see {@link KeyParams.KeyOps} - Key operations parameter
 */
export enum KeyOps {
  /** Compute digital signature */
  Sign = 1,
  /** Verify digital signature */
  Verify = 2,
  /** Encrypt content */
  Encrypt = 3,
  /** Decrypt content */
  Decrypt = 4,
  /** Encrypt key */
  WrapKey = 5,
  /** Decrypt key */
  UnwrapKey = 6,
  /** Derive key */
  DeriveKey = 7,
  /** Derive bits not to be used as a key */
  DeriveBits = 8,
  /** Generate MAC */
  MACCreate = 9,
  /** Verify MAC */
  MACVerify = 10,
}

/**
 * Options for verifying COSE signatures.
 *
 * @description
 * Configuration options that can be provided when verifying COSE signatures.
 * These options allow for customization of the verification process including
 * external additional authenticated data, detached payloads, and algorithm restrictions.
 */
export type VerifyOptions = {
  /** External Additional Authenticated Data to include in verification */
  externalAad?: Uint8Array;
  /** Detached payload data when the payload is not embedded in the COSE structure */
  detachedPayload?: Uint8Array;
};
