import { Sign1 } from '@auth0/cose';

/**
 * Convert a byte array to a COSE Sign1 object.
 * @param {Uint8Array} data - The byte array to convert.
 * @returns {Sign1} The COSE Sign1 object.
 * @throws {Error} If the byte array is not a valid COSE Sign1 object.
 */
export function bytes2CoseSign1(data: Uint8Array): Sign1 {
  const decoded = Sign1.decode(data);
  return decoded;
}

/**
 * Convert a COSE Sign1 as a list to a COSE Sign1 object.
 * @param {ConstructorParameters<typeof Sign1>} data - The CBOR list to convert.
 * @returns {Sign1} The COSE Sign1 object.
 * @throws {Error} If the CBOR list is not a valid COSE Sign1 object.
 */
export function cborlist2CoseSign1(
  data: ConstructorParameters<typeof Sign1>
): Sign1 {
  const decoded = new Sign1(...data);
  return decoded;
}

// function prettyPrint(cborLoaded: Record<string, any>): void {
//   console.log(JSON.stringify(cborLoaded, null, 4));
// }

/**
 * Shuffle the keys of a dictionary.
 * @param {Record<string, unknown>} dict - The dictionary to shuffle.
 * @returns {Record<string, unknown>} The dictionary with shuffled keys.
 */
export function shuffleDict<T>(d: Record<string, T>): Record<string, T> {
  const keys = Object.keys(d);
  for (let i = 0; i < Math.floor(Math.random() * 25) + 3; i++) {
    keys.sort(() => Math.random() - 0.5);
  }
  return Object.fromEntries(keys.map((key) => [key, d[key]]));
}
