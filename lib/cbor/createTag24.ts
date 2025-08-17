import { Tag } from 'cbor-x';
import { encodeCbor, AdvancedOptions } from './codec';

/**
 * Creates a CBOR Tag 24 for an input value
 * @description
 * Produces a Tag(24, bstr) where the value is the CBOR bytes of the input.
 * This matches CDDL `.cbor` usage (embedded CBOR) and is equivalent to
 * `new Tag(encodeCbor(input), 24)`.
 *
 * @param input - Any value to be CBOR-encoded and embedded as Tag 24
 * @param additionalOptions - Optional CBOR options used when encoding the input
 * @returns A `Tag` instance with `tag === 24` and value `Uint8Array`
 */
export const createTag24 = (
  input: unknown,
  additionalOptions: AdvancedOptions = {}
): Tag => {
  const inner = encodeCbor(input, additionalOptions);
  return new Tag(inner, 24);
};
