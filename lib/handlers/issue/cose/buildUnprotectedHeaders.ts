import { Headers, UnprotectedHeaders } from '@/cose';

/**
 * Builds unprotected headers for COSE (CBOR Object Signing and Encryption) operations.
 *
 * This function creates unprotected headers containing an X.509 certificate chain.
 * The certificate chain is stored in the X5Chain header parameter, which allows
 * recipients to verify the authenticity of the signer's certificate.
 *
 * @param x5c - Array of X.509 certificates as Uint8Array, typically representing
 *              a certificate chain from the signer's certificate to a trusted root
 * @returns An UnprotectedHeaders instance containing the X.509 certificate chain
 *
 * @example
 * ```typescript
 * // Single certificate
 * const certBytes = new Uint8Array([0x30, 0x82, 0x01, 0x3d]); // certificate bytes
 * const headers = buildUnprotectedHeaders([certBytes]);
 *
 * // Certificate chain (leaf to root)
 * const leafCert = new Uint8Array([0x30, 0x82, 0x01, 0x3d]); // leaf certificate bytes
 * const intermediateCert = new Uint8Array([0x30, 0x82, 0x01, 0x4a]); // intermediate certificate bytes
 * const rootCert = new Uint8Array([0x30, 0x82, 0x01, 0x5b]); // root certificate bytes
 * const headers = buildUnprotectedHeaders([leafCert, intermediateCert, rootCert]);
 * ```
 *
 * @example
 * ```typescript
 * // From base64 encoded certificate
 * const certBase64 = 'MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==';
 * const certBytes = Buffer.from(certBase64, 'base64');
 * const headers = buildUnprotectedHeaders([new Uint8Array(certBytes, certBytes.byteOffset, certBytes.byteLength)]);
 * ```
 */
export const buildUnprotectedHeaders = (
  x5c: Uint8Array[]
): UnprotectedHeaders => {
  return new UnprotectedHeaders([[Headers.X5Chain, x5c]]);
};
