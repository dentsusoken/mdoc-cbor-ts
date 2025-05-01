import {
  Algorithms,
  Headers,
  ProtectedHeaders,
  Sign1,
  UnprotectedHeaders,
} from '@auth0/cose';
import { importX509, KeyLike } from 'jose';
import { X509Certificate } from 'node:crypto';
import { IssuerAuth } from '../../../schemas/mso';
import { lookupAlgorithm } from '../../../utils/lookupAlgorithm';

/**
 * Type definition for extracting public key from issuer authentication
 * @description
 * A function type that extracts a public key from the issuer's authentication data.
 * The function processes the protected and unprotected headers to find the
 * X.509 certificate chain and algorithm information.
 */
export type ExtractPublicKey = (issuerAuth: IssuerAuth) => Promise<KeyLike>;

/**
 * Extracts a public key from issuer authentication data
 * @description
 * Processes the issuer's authentication data to extract and import the public key.
 * The function looks for X.509 certificates in both protected and unprotected headers,
 * and determines the signing algorithm from the headers.
 *
 * @param issuerAuth - The issuer's authentication data containing headers and certificates
 * @returns A Promise that resolves to the imported public key
 * @throws {Error} If no X.509 certificate is found in the headers
 *
 * @example
 * ```typescript
 * const publicKey = await extractPublicKey(issuerAuth);
 * ```
 */
export const extractPublicKey: ExtractPublicKey = async (issuerAuth) => {
  const sign1 = new Sign1(...issuerAuth);
  const protectedHeaders = ProtectedHeaders.from(
    sign1.protectedHeaders.entries() as Iterable<
      [Headers.Algorithm, Algorithms]
    >
  );
  const unprotectedHeaders = UnprotectedHeaders.from(
    sign1.unprotectedHeaders.entries() as Iterable<
      [Headers.Algorithm, Algorithms]
    >
  );

  // TODO: 多分ヘッダーを結合したほうがいい気がする。
  const x5c =
    protectedHeaders.get(Headers.X5Chain) ??
    unprotectedHeaders.get(Headers.X5Chain);

  if (!x5c || x5c.length === 0) {
    throw new Error('X509 certificate not found');
  }

  const alg = lookupAlgorithm(
    protectedHeaders.get(Headers.Algorithm) ??
      unprotectedHeaders.get(Headers.Algorithm)
  );

  const certs: X509Certificate[] = [];
  if (Array.isArray(x5c)) {
    x5c.forEach((cert) => {
      certs.push(new X509Certificate(cert));
    });
  } else {
    certs.push(new X509Certificate(x5c));
  }

  const pem = certs[0].toString();
  return await importX509(pem, alg);
};
