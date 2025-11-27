import { encodeCbor } from '@/cbor/codec';
import { createTag18 } from '@/cbor/createTag18';
import { Sign1 } from '@/cose/Sign1';
import { Header } from '@/cose/types';
import { JwkPrivateKey } from '@/jwk/types';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { DeviceSignature } from '@/schemas/mdoc/DeviceSignature';
import { SessionTranscript } from '@/mdoc/types';
import { Tag } from 'cbor-x';
import { jwkToCoseAlgorithm } from '@/jwk-to-cose';
import { resolveAlgorithmName } from 'noble-curves-extended';

/**
 * Parameters for building a device signature for mdoc DeviceAuthentication.
 */
interface BuildDeviceSignatureParams {
  /**
   * The session transcript tuple structure for DeviceAuthentication.
   *
   * @description
   * A tuple structure: [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover].
   * Each entry may be null if absent, per mdoc session transcript specification.
   *
   * @see {@link SessionTranscript}
   */
  sessionTranscript: SessionTranscript;
  /** The document type string (docType) as per ISO/IEC 18013-5. */
  docType: string;
  /**
   * The device nameSpaces encoded as CBOR Tag 24 (DeviceNameSpacesBytes).
   * This represents the device-signed namespaces wrapped in Tag 24.
   *
   * @see {@link createTag24}
   */
  nameSpacesBytes: Tag;
  /** The device's private JWK for signing the DeviceAuthentication. */
  deviceJwkPrivateKey: JwkPrivateKey;
}

/**
 * Builds a device signature for DeviceAuthentication for mdoc.
 *
 * @description
 * Produces a COSE_Sign1 signature ("DeviceSignature") over the CBOR-encoded DeviceAuthentication payload.
 * The DeviceAuthentication payload includes session transcript, docType, and deviceNameSpacesBytes,
 * adhering to ISO/IEC 18013-5 specifications.
 *
 * The function:
 * 1. Encodes the DeviceAuthentication structure using {@link encodeDeviceAuthentication}
 * 2. Creates a COSE_Sign1 signature with detached payload (payload is null)
 * 3. Wraps the signature as CBOR Tag 18 (COSE_Sign1)
 *
 * @param params - The parameters for constructing the device signature.
 * @param params.sessionTranscript The session transcript tuple structure for DeviceAuthentication.
 * @param params.docType The mdoc document type string.
 * @param params.nameSpacesBytes The device nameSpaces, encoded as CBOR Tag 24.
 * @param params.deviceJwkPrivateKey The device's private JWK (EC, P-256, etc) for signing.
 * @returns The device signature as a tagged COSE_Sign1 structure (DeviceSignature).
 *
 * @see {@link encodeDeviceAuthentication}
 * @see {@link Sign1}
 * @see {@link createTag18}
 * @see {@link SessionTranscript}
 * @see https://www.iso.org/standard/69084.html (ISO/IEC 18013-5)
 *
 * @example
 * ```typescript
 * const sessionTranscript: SessionTranscript = [null, null, handoverData];
 * const docType = "org.iso.18013.5.1.mDL";
 * const nameSpacesBytes = createTag24(new Map([["org.iso.18013.5.1", new Map([["claim", 42]])]]));
 * const deviceSignature = buildDeviceSignature({
 *   sessionTranscript,
 *   docType,
 *   nameSpacesBytes,
 *   deviceJwkPrivateKey,
 * });
 * ```
 */
export const buildDeviceSignature = ({
  sessionTranscript,
  docType,
  nameSpacesBytes,
  deviceJwkPrivateKey,
}: BuildDeviceSignatureParams): DeviceSignature => {
  const jwkAlgorithm = resolveAlgorithmName({
    algorithmName: deviceJwkPrivateKey.alg,
    curveName: deviceJwkPrivateKey.crv,
  });
  const algorithm = jwkToCoseAlgorithm(jwkAlgorithm);
  const detachedPayload = encodeDeviceAuthentication({
    sessionTranscript,
    docType,
    nameSpacesBytes,
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
