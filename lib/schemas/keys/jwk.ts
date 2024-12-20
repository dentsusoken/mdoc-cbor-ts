import { z } from 'zod';

/**
 * JSON Web Key (JWK) schema definition based on RFC7517
 * Represents a cryptographic key in JSON format
 */
export const jwkSchema = z
  .object({
    /**
     * Key Type parameter
     * Identifies the cryptographic algorithm family used with the key
     * Required parameter
     */
    kty: z.string(),

    /**
     * Algorithm parameter
     * Identifies the algorithm intended for use with the key
     */
    alg: z.string().optional(),

    /**
     * Public Key Use parameter
     * Identifies the intended use of the public key
     */
    use: z.string().optional(),

    /**
     * Key Operations parameter
     * Identifies the operation(s) for which the key is intended to be used
     */
    key_ops: z.array(z.string()).optional(),

    /**
     * Key ID parameter
     * Unique identifier for the key
     */
    kid: z.string().optional(),

    /**
     * Extractable parameter
     * Indicates if the key is extractable
     */
    ext: z.boolean().optional(),

    /**
     * Key Value parameter
     * The raw key value for symmetric keys
     */
    k: z.string().optional(),

    /**
     * Curve parameter
     * Identifies the cryptographic curve used with the key (for EC keys)
     */
    crv: z.string().optional(),

    /**
     * X Coordinate parameter
     * X coordinate for the Elliptic Curve point (for EC keys)
     */
    x: z.string().optional(),

    /**
     * Y Coordinate parameter
     * Y coordinate for the Elliptic Curve point (for EC keys)
     */
    y: z.string().optional(),

    /**
     * Private Key parameter
     * Private key value (for private keys)
     */
    d: z.string().optional(),

    /**
     * RSA Modulus parameter
     * Modulus value for the RSA public key
     */
    n: z.string().optional(),

    /**
     * RSA Public Exponent parameter
     * Public exponent value for the RSA public key
     */
    e: z.string().optional(),

    /**
     * First Prime Factor parameter
     * First prime factor p for RSA private key
     */
    p: z.string().optional(),

    /**
     * Second Prime Factor parameter
     * Second prime factor q for RSA private key
     */
    q: z.string().optional(),

    /**
     * First Factor CRT Exponent parameter
     * First factor CRT exponent for RSA private key
     */
    dp: z.string().optional(),

    /**
     * Second Factor CRT Exponent parameter
     * Second factor CRT exponent for RSA private key
     */
    dq: z.string().optional(),

    /**
     * First CRT Coefficient parameter
     * First CRT coefficient for RSA private key
     */
    qi: z.string().optional(),

    /**
     * Other Primes Info parameter
     * Additional prime factors for multi-prime RSA
     */
    oth: z
      .array(
        z.object({
          d: z.string().optional(),
          r: z.string().optional(),
          t: z.string().optional(),
        })
      )
      .optional(),

    /**
     * X.509 Certificate Chain parameter
     * Contains a chain of one or more PKIX certificates
     */
    x5c: z.array(z.string()).optional(),

    /**
     * X.509 Certificate SHA-1 Thumbprint parameter
     * Base64url-encoded SHA-1 thumbprint of the DER encoding of an X.509 certificate
     */
    x5t: z.string().optional(),

    /**
     * X.509 Certificate SHA-256 Thumbprint parameter
     * Base64url-encoded SHA-256 thumbprint of the DER encoding of an X.509 certificate
     */
    'x5t#S256': z.string().optional(),

    /**
     * X.509 URL parameter
     * URI that refers to a resource for an X.509 public key certificate or certificate chain
     */
    x5u: z.string().optional(),
  })
  .passthrough(); // Allow additional properties (corresponds to [propName: string]: unknown)

/**
 * Type definition for JSON Web Key (JWK)
 * Represents a cryptographic key in JSON format
 */
export type JWK = z.infer<typeof jwkSchema>;
