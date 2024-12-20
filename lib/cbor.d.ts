declare module 'cbor' {
  export * from 'cbor-x';

  export class Tag<T = unknown> {
    constructor(value: T, tagNumber: number);
    value: T;
    tag: number;
  }
}
