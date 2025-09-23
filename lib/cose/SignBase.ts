import { UnprotectedHeaders } from './UnprotectedHeaders';
import { ProtectedHeaders } from './ProtectedHeaders';
import { decodeCbor, encodeCbor } from '@/cbor/codec';

export class SignBase {
  public readonly protectedHeaders: ProtectedHeaders;
  public readonly unprotectedHeaders: UnprotectedHeaders;
  public readonly encodedProtectedHeaders: Uint8Array;

  constructor(
    protectedHeaders: ProtectedHeaders | Uint8Array,
    unprotectedHeaders: UnprotectedHeaders
  ) {
    if (protectedHeaders instanceof ProtectedHeaders) {
      this.protectedHeaders = protectedHeaders;
      this.encodedProtectedHeaders = encodeCbor(protectedHeaders);
    } else {
      this.encodedProtectedHeaders = protectedHeaders;
      this.protectedHeaders = decodeCbor(protectedHeaders) as ProtectedHeaders;
    }
    this.unprotectedHeaders = unprotectedHeaders;
  }
}
