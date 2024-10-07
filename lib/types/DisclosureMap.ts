import { Tag } from 'cbor-x';
import { Settings } from '../settings';

/**
 * DisclosureMapItem is a single item in the disclosure map.
 * It contains the digestID, elementIdentifier, elementValue, and a random value.
 * @property {Uint8Array} random - The random value.
 * @property {number} digestID - The digest ID.
 * @property {string} elementIdentifier - The element identifier.
 * @property {unknown} elementValue - The element value.
 */
export class DisclosureMapItem {
  public readonly random: Uint8Array;

  /**
   * Create a new DisclosureMapItem instance.
   * @param {number} digestID - The digest ID.
   * @param {string} elementIdentifier - The element identifier.
   * @param {unknown} elementValue - The element value.
   * @returns {DisclosureMapItem} The DisclosureMapItem instance.
   */
  constructor(
    public readonly digestID: number,
    public readonly elementIdentifier: string,
    public readonly elementValue: unknown
  ) {
    const settings = new Settings();
    if (settings.CBORTAGS_ATTR_MAP[this.elementIdentifier]) {
      this.elementValue = new Tag(
        this.elementValue,
        settings.CBORTAGS_ATTR_MAP[this.elementIdentifier]
      );
    }
    this.random = crypto.getRandomValues(
      new Uint8Array(settings.DIGEST_SALT_LENGTH)
    );
  }

  /**
   * Convert the disclosure map item to JSON.
   * @returns {Record<string, unknown>} The JSON object.
   */
  toJSON() {
    return {
      random: Buffer.from(this.random),
      digestID: this.digestID,
      elementIdentifier: this.elementIdentifier,
      elementValue: this.elementValue,
    };
  }
}

/**
 * DisclosureMap is a map of disclosure map items.
 * The key is the element identifier and the value is the disclosure map item.
 */
export type DisclosureMap = Record<string, Record<number, DisclosureMapItem>>;
