import { KJUR } from 'jsrsasign';
import { decodeHex } from 'u8a-utils';

/**
 * Converts an X.509 certificate to DER-encoded bytes.
 * @description
 * Takes a KJUR X.509 certificate object and converts it to its DER (Distinguished Encoding Rules)
 * binary representation as a Uint8Array. This is useful for operations that require the raw
 * certificate bytes, such as hashing or binary transmission.
 *
 * @param certificate - The X.509 certificate object from jsrsasign
 * @returns The DER-encoded certificate as a Uint8Array
 *
 * @example
 * ```typescript
 * import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
 * import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
 *
 * const certificate = createSelfSignedCertificate({
 *   publicKeyJwk,
 *   privateKeyJwk,
 *   subject: 'Test Certificate',
 *   serialHex: '01'
 * });
 *
 * const derBytes = certificateToDerBytes(certificate);
 * console.log(derBytes); // Uint8Array containing DER-encoded certificate
 * ```
 */
export const certificateToDerBytes = (
  certificate: KJUR.asn1.x509.Certificate
): Uint8Array => {
  return decodeHex(certificate.getEncodedHex());
};
