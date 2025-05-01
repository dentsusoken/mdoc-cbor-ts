import { Headers, UnprotectedHeaders } from '@auth0/cose';
import { X509Certificate } from 'node:crypto';

/**
 * Type definition for building unprotected headers
 * @description
 * A function that creates unprotected headers for a COSE message using the provided
 * X.509 certificate. The function creates headers containing the certificate chain.
 *
 * @param cert - The X.509 certificate to include in the headers
 * @returns The created UnprotectedHeaders object
 */
export type BuildUnprotectedHeaders = (
  cert: X509Certificate
) => UnprotectedHeaders;

/**
 * Creates unprotected headers for a COSE message
 * @description
 * Creates unprotected headers containing the X.509 certificate chain.
 * The certificate is included in the X5Chain header as a raw data array.
 *
 * @example
 * ```typescript
 * const unprotectedHeaders = buildUnprotectedHeaders(certificate);
 * ```
 */
export const buildUnprotectedHeaders: BuildUnprotectedHeaders = (
  cert: X509Certificate
) => {
  return new UnprotectedHeaders([[Headers.X5Chain, new Uint8Array(cert.raw)]]);
};
