import { encode, Tag } from 'cbor-x';

export class TypedTag<T = unknown> extends Tag {
  constructor(public value: T, public tag: number) {
    super(value, tag);
  }

  encode() {
    return new TypedTag(encode(this.value), this.tag);
  }
}
