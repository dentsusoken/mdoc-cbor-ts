import { decode, Sign1 } from '@auth0/cose';

/**
 * Convert a byte array to a COSE Sign1 object.
 * @param {Uint8Array} data - The byte array to convert.
 * @returns {Sign1} The COSE Sign1 object.
 * @throws {Error} If the byte array is not a valid COSE Sign1 object.
 */
export const bytes2CoseSign1 = (data: Uint8Array): Sign1 => {
  return decode(data, Sign1);
};

/**
 * Convert a COSE Sign1 as a list to a COSE Sign1 object.
 * @param {ConstructorParameters<typeof Sign1>} data - The CBOR list to convert.
 * @returns {Sign1} The COSE Sign1 object.
 * @throws {Error} If the CBOR list is not a valid COSE Sign1 object.
 */
export const cborlist2CoseSign1 = (
  data: ConstructorParameters<typeof Sign1>
): Sign1 => {
  return new Sign1(...data);
};

/**
 * Shuffle the keys of a dictionary.
 * @param {Record<string, unknown>} dict - The dictionary to shuffle.
 * @returns {Record<string, unknown>} The dictionary with shuffled keys.
 */
export const shuffleDict = (
  dict: Record<string, unknown>
): Record<string, unknown> => {
  const keys = Object.keys(dict);
  const shuffledKeys = keys.sort(() => Math.random() - 0.5);
  return shuffledKeys.reduce((acc, key) => {
    acc[key] = dict[key];
    return acc;
  }, {} as Record<string, unknown>);
};
