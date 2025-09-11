import { X509 } from 'jsrsasign';

/**
 * Converts a PEM-encoded X.509 certificate to a jsrsasign X509 object.
 * @description
 * Takes a PEM-formatted certificate string and parses it into a jsrsasign X509 object
 * that can be used for certificate operations like validation, field extraction, and analysis.
 *
 * @param pem - The PEM-encoded X.509 certificate string (including BEGIN/END markers)
 * @returns A jsrsasign X509 object representing the parsed certificate
 *
 * @example
 * ```typescript
 * const pemCert = `-----BEGIN CERTIFICATE-----
 * MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9...
 * -----END CERTIFICATE-----`;
 *
 * const x509 = pemToX509(pemCert);
 * console.log(x509.getSubjectString()); // Get certificate subject
 * ```
 */
export const pemToX509 = (pem: string): X509 => {
  const x509 = new X509();
  x509.readCertPEM(pem);
  return x509;
};
