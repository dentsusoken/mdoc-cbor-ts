import { SignBase } from './SignBase';
import { VerifyOptions } from './types';
import { JwkPrivateKey } from '@/jwk/types';
import { encodeSignature1 } from './encodeSignature1';
import {
  createSignatureCurveRngDisallowed,
  JwkPublicKey,
} from 'noble-curves-extended';

/**
 * Parameters for creating and signing a COSE_Sign1 structure.
 *
 * @description
 * Expects CBOR-encoded protected headers bytes and an optional map of
 * unprotected headers. The payload can be embedded (provide `payload`)
 * or detached (set `payload` to null and provide `detachedPayload`).
 * Exactly one of `payload` or `detachedPayload` must be provided.
 * Optional `externalAad` is included in the Sig_structure.
 */
type SignParams = {
  /** CBOR-encoded protected headers bytes (bstr) */
  protectedHeaders: Uint8Array;
  /** Unprotected headers map (defaults to empty) */
  unprotectedHeaders?: Map<number, unknown>;
  /** External Additional Authenticated Data (defaults to empty) */
  externalAad?: Uint8Array;
  /** Embedded payload bytes, or null when using detached payload */
  payload: Uint8Array | null;
  /** Detached payload bytes when `payload` is null */
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
   * Verifies the signature using the provided JWK public key.
   *
   * @description
   * This method verifies the COSE_Sign1 signature using the given {@link JwkPublicKey}.
   * In the case of Device authentication, the X.509 certificate chain header is not present,
   * so the public key must be provided directly via the `jwkPublicKey` argument.
   *
   * If the signature was created with external Additional Authenticated Data (AAD) or a detached payload,
   * you MUST provide the same values via `options.externalAad` and/or `options.detachedPayload` for verification to succeed.
   * When the embedded payload is `null`, verification cannot proceed without `options.detachedPayload`.
   *
   * @param jwkPublicKey The JWK public key to use for signature verification.
   * @param options Optional verification inputs.
   * @param options.externalAad External Additional Authenticated Data used at sign time.
   * @param options.detachedPayload Detached payload bytes when this.payload is null.
   * @throws Error If the detached payload is required but not provided, or if signature verification fails.
   */
  verify = (jwkPublicKey: JwkPublicKey, options?: VerifyOptions): void => {
    if (options?.detachedPayload === undefined && this.payload === null) {
      throw new Error('Detached payload is required when payload is null');
    }

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
