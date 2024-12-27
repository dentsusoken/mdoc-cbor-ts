export interface MdocVerifySuccess<T> {
  verified: true;
  data: T;
}

export interface MdocVerifyFailure {
  verified: false;
  errors: Error[];
}

export type MdocVerifyResult<T> = MdocVerifySuccess<T> | MdocVerifyFailure;

export interface MdocVerifyHandler<T> {
  verify(cbor: string): Promise<MdocVerifyResult<T>>;
}
