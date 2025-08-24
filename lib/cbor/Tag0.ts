import { addExtension } from 'cbor-x';

export class Tag0 {
  value: string;

  constructor(value: string) {
    this.value = new Date(value).toISOString().split('.')[0] + 'Z';
  }
}

/**
 * CBOR extension for DateTime values
 * @description
 * Registers a CBOR extension for DateTime values with tag 0.
 * The extension handles encoding and decoding of date-time values.
 */
addExtension({
  Class: Tag0,
  tag: 0,
  encode: (tag0: Tag0, encode) => encode(tag0.value),
  decode: (value: string) => new Tag0(value),
});
