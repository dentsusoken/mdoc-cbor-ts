import { X509, zulutodate } from 'jsrsasign';

/**
 * Options for X.509 chain verification.
 * @property now - The time to consider as 'current' for certificate validity checks (defaults to current time).
 * @property clockSkew - Acceptable clock skew in seconds.
 * @description
 * The clockSkew property is specified in seconds.
 */
export interface VerifyX5ChainOptions {
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

/**
 * Checks that the certificate is not used before its NotBefore date, accounting for clock skew.
 *
 * @param {Object} params - Parameters for NotBefore check.
 * @param {number} params.index - Index of the certificate in the chain (for error reporting).
 * @param {string | undefined} params.notBefore - The NotBefore date (Zulu time string) from the certificate.
 * @param {Date} [params.now] - The time to consider as "now" (defaults to current system time if not specified).
 * @param {number} [params.clockSkew=60] - Acceptable clock skew in seconds (default 60s).
 *
 * @throws {Error} If the current time is before the NotBefore date minus clockSkew.
 */
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

/**
 * Parameters for verifying the NotAfter time of a certificate.
 */
interface VerifyNotAfterParams {
  /** Index of the certificate in the chain (for error reporting) */
  index: number;
  /** The NotAfter date (Zulu time string) from the certificate */
  notAfter: string | undefined;
  /** The time to consider as "now" (optional) */
  now?: Date;
  /** Acceptable clock skew in seconds (optional, default 60s) */
  clockSkew?: number;
}

/**
 * Checks that the certificate is not expired (NotAfter), accounting for clock skew.
 *
 * @param {Object} params - Parameters for NotAfter check.
 * @param {number} params.index - Index of the certificate in the chain (for error reporting).
 * @param {string | undefined} params.notAfter - The NotAfter date (Zulu time string) from the certificate.
 * @param {Date} [params.now] - The time to consider as "now" (defaults to current system time if not specified).
 * @param {number} [params.clockSkew=60] - Acceptable clock skew in seconds (default 60s).
 *
 * @throws {Error} If the current time is after the NotAfter date plus clockSkew.
 */
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
 * Verifies an X.509 certificate chain for time validity and signature correctness.
 *
 * @description
 * This function checks that each certificate in the given chain is:
 *   - Valid according to its `notBefore` and `notAfter` time fields, allowing for clock skew.
 *   - Correctly signed by its parent certificate (i.e., using the next certificate's public key),
 *     except for the last certificate (typically the root or self-signed), which is verified against its own public key.
 *
 * The input chain must be ordered from leaf (end-entity) to root (trust anchor).
 * Throws if any certificate is expired, not yet valid, or signature verification fails.
 *
 * @param x5chain - Array of X.509 certificates (ordered from leaf to root).
 * @param options - Optional settings:
 *   - `now`: The time to treat as "current" for certificate validity (defaults to system clock).
 *   - `clockSkew`: Allowable clock skew in seconds (default: 60).
 *
 * @throws {Error} If any certificate is expired, not yet valid, or has invalid signature.
 *
 * @example
 * ```typescript
 * const certificates = [leafX509, intermediateX509, rootX509];
 * // Throws if the chain is invalid
 * verifyX5Chain(certificates);
 * ```
 */
export const verifyX5Chain = (
  x5chain: X509[],
  options: VerifyX5ChainOptions = {}
): void => {
  x5chain.forEach((x509, index) => {
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
      index === x5chain.length - 1
        ? x509.getPublicKey()
        : x5chain[index + 1].getPublicKey();
    if (!x509.verifySignature(publicKey)) {
      throw new Error(`Certificate[${index}] signature is invalid`);
    }
  });
};
