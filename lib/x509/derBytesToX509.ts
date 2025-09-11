import { X509 } from 'jsrsasign';
import { encodeHex } from 'u8a-utils';

/**
 * Converts DER-encoded bytes to a jsrsasign X509 object.
 * @description
 * Takes a DER-encoded certificate bytes and parses it into a jsrsasign X509 object
 * that can be used for certificate operations like validation, field extraction, and analysis.
 *
 * @param derBytes - The DER-encoded certificate bytes
 * @returns A jsrsasign X509 object representing the parsed certificate
 */
export const derBytesToX509 = (derBytes: Uint8Array): X509 => {
  const x509 = new X509();
  x509.readCertHex(encodeHex(derBytes));
  return x509;
};
