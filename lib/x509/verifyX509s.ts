import { X509 } from 'jsrsasign';

/**
 * Verifies a chain of X.509 certificates.
 * @description
 * Validates each certificate in the chain by verifying its signature against the appropriate public key.
 * For intermediate certificates, the signature is verified using the public key of the next certificate
 * in the chain. For the last certificate (root or self-signed), the signature is verified using its own
 * public key.
 *
 * @param x509s - Array of X.509 certificate objects to verify, ordered from leaf to root
 * @returns Array of boolean values indicating whether each certificate's signature is valid
 *
 * @example
 * ```typescript
 * const certificates = [leafCert, intermediateCert, rootCert];
 * const results = verifyX509s(certificates);
 * console.log(results); // [true, true, true] if all certificates are valid
 * ```
 */
export const verifyX5Chain = (x509s: X509[]): boolean[] => {
  return x509s.map((x509, index) => {
    const publicKey =
      index === x509s.length - 1
        ? x509.getPublicKey()
        : x509s[index + 1].getPublicKey();
    try {
      return x509.verifySignature(publicKey);
    } catch (error) {
      console.error(error);
      return false;
    }
  });
};
