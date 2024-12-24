declare module 'cbor-x' {
  import {
    encode,
    decode,
    decodeMultiple,
    addExtension,
    Extensions,
    Tag as CborXTag,
  } from 'cbor-x';

  export { encode, decode, decodeMultiple, addExtension, Extensions };

  export class Tag<T = unknown> extends CborXTag<T> {
    constructor(value: T, tagNumber: number);
    value: T;
    tag: number;
  }
}
