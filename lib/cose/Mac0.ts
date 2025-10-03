import { MacBase } from './MacBase';
import { VerifyOptions } from './types';
import { encodeMAC0 } from './encodeMAC0';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { generateHmac } from '@/utils/generateHmac';
import { JwkOctKey } from '@/jwk/types';
import { JWK_MAC_ALGORITHM_TO_DIGEST_ALGORITHM } from './constants';
import { isJwkMacAlgorithm } from '@/jwk/isJwkMacAlgorithm';
import { decodeBase64Url } from 'u8a-utils';

type CreateParams = {
  protectedHeaders: Uint8Array;
  unprotectedHeaders?: Map<number, unknown>;
  externalAad?: Uint8Array;
  payload: Uint8Array | null;
  detachedPayload?: Uint8Array;
  jwkOctKey: JwkOctKey;
};

export class Mac0 extends MacBase {
  /** COSE payload bytes */
  readonly payload: Uint8Array | null;

  static create = ({
    protectedHeaders,
    unprotectedHeaders,
    externalAad,
    payload,
    detachedPayload,
    jwkOctKey,
  }: CreateParams): Mac0 => {
    const uh = unprotectedHeaders ?? new Map<number, unknown>();

    if (payload === null && detachedPayload === undefined) {
      throw new Error(
        "Either 'payload' (embedded) or 'detachedPayload' must be provided"
      );
    }

    if (payload && detachedPayload) {
      throw new Error(
        "Only one of 'payload' or 'detachedPayload' can be provided"
      );
    }

    if (!isJwkMacAlgorithm(jwkOctKey.alg)) {
      throw new Error(`Invalid JWK MAC algorithm: ${jwkOctKey.alg}`);
    }

    const digestAlgorithm =
      JWK_MAC_ALGORITHM_TO_DIGEST_ALGORITHM[jwkOctKey.alg];

    const key = decodeBase64Url(jwkOctKey.k);

    const toBeMaced = encodeMAC0({
      protectedHeaders,
      externalAad,
      payload: (payload ?? detachedPayload)!,
    });

    const tag = generateHmac({
      digestAlgorithm,
      key,
      message: toBeMaced,
    });

    return new Mac0(protectedHeaders, uh, payload, tag);
  };

  constructor(
    protectedHeaders: Uint8Array,
    unprotectedHeaders: Map<number, unknown>,
    payload: Uint8Array | null,
    tag: Uint8Array
  ) {
    super(protectedHeaders, unprotectedHeaders, tag);
    this.payload = payload;
  }

  getContentForEncoding = (): [
    Uint8Array,
    Map<number, unknown>,
    Uint8Array | null,
    Uint8Array,
  ] => {
    return [
      this.protectedHeaders,
      this.unprotectedHeaders,
      this.payload,
      this.tag,
    ];
  };

  verify = (jwkOctKey: JwkOctKey, options?: VerifyOptions): void => {
    if (options?.detachedPayload === undefined && this.payload === null) {
      throw new Error('Detached payload is required when payload is null');
    }

    const toBeMaced = encodeMAC0({
      protectedHeaders: this.protectedHeaders,
      externalAad: options?.externalAad,
      payload: options?.detachedPayload ?? this.payload!,
    });

    const ok = this.internalVerify({ jwkOctKey, toBeMaced });

    if (!ok) {
      throw new Error('Failed to verify COSE_Mac0 tag');
    }
  };
}
