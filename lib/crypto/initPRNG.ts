import { KJUR } from 'jsrsasign';
import { RandomBytes } from './types';

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
 * Initializes the Pseudo-Random Number Generator (PRNG) for jsrsasign
 * @description
 * Sets up a custom PRNG implementation for jsrsasign's cryptographic operations.
 * This function configures jsrsasign to use the provided randomBytes function
 * as its source of cryptographically secure random data.
 *
 * The PRNG implementation follows jsrsasign's expected interface with a
 * nextBytes method that fills an array with random bytes.
 *
 * @param randomBytes - Function that generates cryptographically secure random bytes
 *
 * @example
 * ```typescript
 * import { webcrypto } from 'crypto';
 *
 * const randomBytes = (byteLength = 32) => {
 *   const buffer = new Uint8Array(byteLength);
 *   webcrypto.getRandomValues(buffer);
 *   return buffer;
 * };
 *
 * initPRNG(randomBytes);
 * ```
 *
 * @see {@link RandomBytes} for the expected function signature
 */
export const initPRNG = (randomBytes: RandomBytes): void => {
  const prng: SECURERANDOMGEN = {
    nextBytes: function (ba: Array<unknown>): void {
      const n = ba.length;
      const buf = randomBytes(n);
      for (let i = 0; i < n; i++) ba[i] = buf[i];
    },
  };
  setSECURERANDOMGEN(prng);
};
