import { SignBase, VerifyOptions } from './SignBase';
import { JwkPrivateKey } from '@/jwk/types';
import { encodeSignature1 } from './encodeSignature1';
import { encodeCbor } from '@/cbor/codec';
import { createSignatureCurveRngDisallowed } from 'noble-curves-extended';

/**
 * Parameters for creating and signing a COSE_Sign1 structure.
 */
type SignParams = {
  /** Protected headers (object to be CBOR-encoded or already-encoded bytes) */
  protectedHeaders: Uint8Array;
  /** Unprotected headers (defaults to empty) */
  unprotectedHeaders?: Map<number, unknown>;
  /** External AAD/application headers (defaults to empty) */
  externalAad?: Uint8Array;
  /** Payload bytes to be signed */
  payload: Uint8Array | null;
  /** Detached payload for verification when payload is null */
  detachedPayload?: Uint8Array;
  /** JWK private key to sign with */
  jwkPrivateKey: JwkPrivateKey;
};

/**
 * Decoded COSE_Sign1 structure.
 */
export class Sign1 extends SignBase {
  /** COSE payload bytes */
  readonly payload: Uint8Array | null;

  /**
   * Creates and signs a COSE_Sign1 structure.
   */
  static sign = ({
    protectedHeaders,
    unprotectedHeaders,
    externalAad,
    payload,
    detachedPayload,
    jwkPrivateKey,
  }: SignParams): Sign1 => {
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

    const toBeSigned = encodeSignature1({
      protectedHeaders,
      externalAad,
      payload: (payload ?? detachedPayload)!,
    });

    const curve = createSignatureCurveRngDisallowed(jwkPrivateKey.crv);
    const privateKey = curve.toRawPrivateKey(jwkPrivateKey);
    const signature = curve.sign({ privateKey, message: toBeSigned });

    return new Sign1(protectedHeaders, uh, payload, signature);
  };

  /**
   * Constructs a Sign1 instance.
   */
  constructor(
    protectedHeaders: Uint8Array,
    unprotectedHeaders: Map<number, unknown>,
    payload: Uint8Array | null,
    signature: Uint8Array
  ) {
    super(protectedHeaders, unprotectedHeaders, signature);
    this.payload = payload;
  }

  /**
   * Returns the 4-tuple representation required by COSE_Sign1:
   * [protectedHeaders, unprotectedHeaders, payload, signature].
   */
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
      this.signature,
    ];
  };
  /**
   * Verifies the signature using the X.509 chain present in headers.
   * Throws an error if verification fails.
   */
  verify = (options?: VerifyOptions): void => {
    if (options?.detachedPayload === undefined && this.payload === null) {
      throw new Error('Detached payload is required when payload is null');
    }

    if (options?.detachedPayload === undefined && this.payload === null) {
      throw new Error('Detached payload is required when payload is null');
    }
    const jwkPublicKey = this.verifyX509Chain();
    const toBeSigned = encodeSignature1({
      protectedHeaders: this.protectedHeaders,
      externalAad: options?.externalAad,
      payload: options?.detachedPayload ?? this.payload!,
    });

    const ok = this.internalVerify({ jwkPublicKey, toBeSigned });

    if (!ok) {
      throw new Error('Failed to verify COSE_Sign1 signature');
    }
  };
}
