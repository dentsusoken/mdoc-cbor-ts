/**
 * A function that generates cryptographically secure random bytes.
 *
 * @param byteLength - The number of random bytes to generate. Defaults to 32 if not specified.
 * @returns A Uint8Array containing the generated random bytes.
 */
export type RandomBytes = (byteLength?: number) => Uint8Array;
