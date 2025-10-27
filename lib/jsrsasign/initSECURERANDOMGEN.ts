import { KJUR } from 'jsrsasign';
import { RandomBytes } from '@/types';

export type SECURERANDOMGEN = {
  nextBytes: (ba: Array<unknown>) => void;
};

/**
 * Gets the current SECURERANDOMGEN from jsrsasign
 * @returns The current SECURERANDOMGEN object or undefined
 */
export const getSECURERANDOMGEN = (): SECURERANDOMGEN | undefined => {
  // @ts-expect-error - SECURERANDOMGEN is not typed
  return (KJUR.crypto.Util as unknown).SECURERANDOMGEN;
};

/**
 * Sets the SECURERANDOMGEN in jsrsasign
 * @param prng - The PRNG object to set
 */
export const setSECURERANDOMGEN = (prng: SECURERANDOMGEN): void => {
  // @ts-expect-error - SECURERANDOMGEN is not typed
  (KJUR.crypto.Util as unknown).SECURERANDOMGEN = prng;
};

/**
 * Initializes the jsrsasign SECURERANDOMGEN PRNG with a custom random byte generator.
 *
 * @description
 * This function configures jsrsasign's internal pseudo-random number generator (SECURERANDOMGEN)
 * to use the provided `randomBytes` function for cryptographically secure randomness.
 *
 * The provided `randomBytes` function must return a Uint8Array of the specified length.
 * This is necessary for interoperability with libraries (such as jsrsasign) that expect a `nextBytes`
 * method conforming to Java's SecureRandom semantics: it fills a provided array with random bytes.
 *
 * @param randomBytes - A function producing cryptographically secure random bytes.
 *
 * @example
 * ```typescript
 * import { initSECURERANDOMGEN } from './initSECURERANDOMGEN';
 * import { randomBytes as nodeRandomBytes } from 'crypto';
 *
 * // Provide a randomBytes implementation (node.js example)
 * const randomBytes = (length = 32) => new Uint8Array(nodeRandomBytes(length));
 * initSECURERANDOMGEN(randomBytes);
 * ```
 */
export const initSECURERANDOMGEN = (randomBytes: RandomBytes): void => {
  const srg: SECURERANDOMGEN = {
    /**
     * Fills the input array (ba) with random bytes using the provided randomBytes function.
     * @param ba - Array to fill with random bytes (in-place).
     */
    nextBytes: function (ba: Array<unknown>): void {
      const n = ba.length;
      const buf = randomBytes(n);
      for (let i = 0; i < n; i++) ba[i] = buf[i];
    },
  };
  setSECURERANDOMGEN(srg);
};
