import { decodeBase64 } from 'u8a-utils';

/**
 * Converts a PEM-encoded certificate string (possibly containing multiple certificates)
 * into an array of DER-encoded Uint8Array buffers.
 *
 * @param {string} pem - The PEM-encoded certificate string. May contain one or more certificates.
 * @returns {Uint8Array[]} An array of DER-encoded certificate bytes.
 *
 * @example
 * const pem = `
 * -----BEGIN CERTIFICATE-----
 * MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn...
 * -----END CERTIFICATE-----
 * -----BEGIN CERTIFICATE-----
 * MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAz...
 * -----END CERTIFICATE-----
 * `;
 * const derBytesArray = certificatePemToDerBytes(pem);
 */
export const certificatePemToDerBytes = (pem: string): Uint8Array[] => {
  return pem
    .split(/-----END CERTIFICATE-----/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => {
      const fullBlock = `${block}\n-----END CERTIFICATE-----`;
      const base64 = fullBlock
        .replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\s+/g, '');
      return decodeBase64(base64);
    });
};
