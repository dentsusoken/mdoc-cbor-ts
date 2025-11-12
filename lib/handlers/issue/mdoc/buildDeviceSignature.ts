import { encodeCbor } from '@/cbor/codec';
import { createTag18 } from '@/cbor/createTag18';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { jwkToCoseCurveAlgorithm } from '@/cose/jwkToCoseCurveAlgorithm';
import { Sign1 } from '@/cose/Sign1';
import { Header } from '@/cose/types';
import { JwkPrivateKey } from '@/jwk/types';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { DeviceSignature } from '@/schemas/mdoc/DeviceSignature';

/**
 * Parameters for building a device signature for mdoc DeviceAuthentication.
 */
interface BuildDeviceSignatureParams {
  /** CBOR-encoded session transcript for the authentication (Tag 24 wrapped). */
  sessionTranscriptBytes: Uint8Array;
  /** Document type string (docType) as per ISO/IEC 18013-5. */
  docType: string;
  /**
   * Optional device nameSpaces mapping for DeviceAuthentication.
   *
   * This maps each namespace string (e.g., "org.iso.18013.5.1") to a sub-Map
   * where the keys are element identifiers (data elements) and the values are the associated data.
   *
   * For example, a typical structure:
   * ```ts
   * new Map([
   *   [
   *     "org.iso.18013.5.1",
   *     new Map([
   *       ["given_name", "John"],
   *       ["family_name", "Doe"],
   *     ])
   *   ]
   * ])
   * ```
   */
  nameSpaces?: Map<string, Map<string, unknown>>;
  /** Device's private JWK to use for signing the DeviceAuthentication. */
  deviceJwkPrivateKey: JwkPrivateKey;
}

/**
 * Builds a device signature for DeviceAuthentication for mdoc.
 *
 * The structure is as follows:
 * - Produces a COSE_Sign1 signature ("DeviceSignature") over the CBOR-encoded DeviceAuthentication payload.
 * - DeviceAuthentication payload includes session transcript, docType, and nameSpaces, adhering to mDL/mDoc specs.
 * - Signs using the provided device private key and wraps as CBOR Tag 18 ("COSE_Sign1").
 *
 * @param params - The parameters for constructing the device signature.
 * @param params.sessionTranscriptBytes The CBOR Tag 24-encoded session transcript (Uint8Array).
 * @param params.docType The mdoc document type.
 * @param params.nameSpaces The nameSpaces map for mdoc under device control (optional).
 * @param params.deviceJwkPrivateKey Device's private JWK (EC, P-256, etc).
 * @returns The device signature as a tagged COSE_Sign1 structure (DeviceSignature).
 *
 * @see {@link encodeDeviceAuthentication}
 * @see {@link Sign1}
 * @see {@link createTag18}
 */
export const buildDeviceSignature = ({
  sessionTranscriptBytes,
  docType,
  nameSpaces = new Map(),
  deviceJwkPrivateKey,
}: BuildDeviceSignatureParams): DeviceSignature => {
  const { algorithm } = jwkToCoseCurveAlgorithm(deviceJwkPrivateKey);
  // Decode sessionTranscriptBytes to tuple format
  const sessionTranscript = decodeTag24(
    sessionTranscriptBytes
  ) as [Uint8Array | null, Uint8Array | null, unknown];
  const deviceNameSpacesBytes = createTag24(nameSpaces);
  const detachedPayload = encodeDeviceAuthentication({
    sessionTranscript,
    docType,
    deviceNameSpacesBytes,
  });
  const payload = null;
  const sign1 = Sign1.sign({
    protectedHeaders: encodeCbor(
      new Map<number, unknown>([[Header.Algorithm, algorithm]])
    ),
    unprotectedHeaders: new Map<number, unknown>(),
    payload,
    detachedPayload,
    jwkPrivateKey: deviceJwkPrivateKey,
  });

  return createTag18(sign1.getContentForEncoding());
};
