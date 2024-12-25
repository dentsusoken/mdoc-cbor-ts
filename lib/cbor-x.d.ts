import * as cborX from 'cbor-x';

declare module 'cbor-x' {
  export * from cborX;

  export interface Tag<T = any> {
    value: T;
    tag: number;
  }
}
