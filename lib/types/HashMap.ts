import { encode, Tag } from 'cbor-x';
import { DisclosureMapItem } from './DisclosureMap';

/**
 * HashMap is a map of hash map items.
 * The key is the element identifier and the value is the hash map item.
 */
export type HashMap = Record<string, Record<number, ArrayBuffer>>;

/**
 * HashMapItem is a single item in the hash map.
 * It contains the digestID, elementIdentifier, elementValue, and a random value.
 * @property {DisclosureMapItem} disclosureMapItem - The disclosure map item.
 */
export class HashMapItem {
  /**
   * Create a new HashMapItem instance.
   * @param {DisclosureMapItem} disclosureMapItem - The disclosure map item.
   * @returns {HashMapItem} The HashMapItem instance.
   */
  constructor(public readonly disclosureMapItem: DisclosureMapItem) {}

  /**
   * Encode the hash map item to bytes.
   * @returns {Buffer} The encoded hash map.
   */
  encode() {
    return encode(new Tag(encode(this.disclosureMapItem.toJSON()), 24));
  }

  /**
   * Calculate the hash of the hash map item.
   * @returns {Promise<ArrayBuffer>} The encoded hash map item.
   */
  digest(alg: string = 'SHA-256') {
    return crypto.subtle.digest(alg, this.encode());
  }
}
