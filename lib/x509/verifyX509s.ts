import { X509, zulutodate } from 'jsrsasign';

/**
 * Options for X.509 chain verification.
 * @property now - The time to consider as 'current' for certificate validity checks (defaults to current time).
 * @property clockSkew - Acceptable clock skew in seconds.
 * @description
 * The clockSkew property is specified in seconds.
 */
interface VerifyX5ChainOptions {
  /** The time to use as "now" for certificate validity checks (defaults to current time) */
  now?: Date;
  /** Acceptable clock skew, in seconds */
  clockSkew?: number;
}

interface VerifyNotBeforeParams {
  index: number;
  notBefore: string | undefined;
  now?: Date;
  clockSkew?: number;
}

export const verifyNotBefore = ({
  index,
  notBefore,
  now,
  clockSkew = 60,
}: VerifyNotBeforeParams): void => {
  if (!notBefore || !now) {
    return;
  }
  const notBeforeDate = zulutodate(notBefore);
  if (now.getTime() < notBeforeDate.getTime() - clockSkew * 1000) {
    throw new Error(`Certificate[${index}] is not valid yet`);
  }
};

interface VerifyNotAfterParams {
  index: number;
  notAfter: string | undefined;
  now?: Date;
  clockSkew?: number;
}

export const verifyNotAfter = ({
  index,
  notAfter,
  now,
  clockSkew = 60,
}: VerifyNotAfterParams): void => {
  if (!notAfter || !now) {
    return;
  }
  const notAfterDate = zulutodate(notAfter);
  if (now.getTime() > notAfterDate.getTime() + clockSkew * 1000) {
    throw new Error(`Certificate[${index}] is expired`);
  }
};

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
export const verifyX5Chain = (
  x509s: X509[],
  options: VerifyX5ChainOptions = {}
): void => {
  x509s.forEach((x509, index) => {
    verifyNotBefore({
      index,
      notBefore: x509.getNotBefore(),
      now: options.now,
      clockSkew: options.clockSkew,
    });
    verifyNotAfter({
      index,
      notAfter: x509.getNotAfter(),
      now: options.now,
      clockSkew: options.clockSkew,
    });
    const publicKey =
      index === x509s.length - 1
        ? x509.getPublicKey()
        : x509s[index + 1].getPublicKey();
    if (!x509.verifySignature(publicKey)) {
      throw new Error(`Certificate[${index}] signature is invalid`);
    }
  });
};
