import { addExtension } from 'cbor-x';

/**
 * Content structure for CBOR Tag 18 (COSE_Sign1).
 * @description
 * Represents the 4-tuple structure of a COSE_Sign1 message:
 * [protected headers, unprotected headers, payload, signature]
 */
type Tag18Content = [Uint8Array, Map<number, unknown>, Uint8Array, Uint8Array];

/**
 * CBOR Tag 18 for COSE_Sign1 structures.
 * @description
 * Represents a COSE_Sign1 message wrapped in CBOR Tag 18.
 * This tag is used to identify CBOR-encoded COSE_Sign1 structures.
 */
export class Tag18 {
  /** The COSE_Sign1 content as a 4-tuple */
  value: Tag18Content;

  /**
   * Creates a new Tag18 instance.
   * @param value - The COSE_Sign1 content as a 4-tuple
   */
  constructor(value: Tag18Content) {
    this.value = value;
  }
}

/**
 * CBOR extension for COSE_Sign1 structures with tag 18.
 * @description
 * Registers a CBOR extension for COSE_Sign1 structures with tag 18.
 * The extension handles encoding and decoding of COSE_Sign1 messages.
 */
addExtension({
  Class: Tag18,
  tag: 18,
  encode: (tag18: Tag18, encode) => encode(tag18.value),
  decode: (value: Tag18Content) => new Tag18(value),
});
