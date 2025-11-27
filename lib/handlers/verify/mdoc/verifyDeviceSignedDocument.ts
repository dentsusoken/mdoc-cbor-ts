import { toDeviceSignedDocumentObject } from '@/handlers/to-object/toDeviceSignedDocumentObject';
import { toMobileSecurityObjectObject } from '@/handlers/to-object/toMobileSecurityObjectObject';
import { toDeviceKeyInfoObject } from '@/handlers/to-object/toDeviceKeyInfoObject';
import { Document } from '@/schemas/mdoc/Document';
import { verifyIssuerSigned } from '../mso/verifyIssuerSigned';
import { SessionTranscript } from '@/mdoc/types';
import { toSign1 } from '@/cose/toSign1';
import { coseToJwkPublicKey } from '@/cose-to-jwk/coseToJwkPublicKey';
import { toDeviceAuthObject } from '@/handlers/to-object/toDeviceAuthObject';
import { toDeviceSignedObject } from '@/handlers/to-object/toDeviceSignedObject';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';

/**
 * Parameters for verifying a device-signed document.
 */
interface VerifyDeviceSignedDocumentParams {
  /** The device-signed document to verify */
  deviceSignedDocument: Document;
  /** The session transcript tuple [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover] */
  sessionTranscript: SessionTranscript;
  /** The current date and time for evaluating validity dates (defaults to current time) */
  now?: Date;
  /** Acceptable clock skew in seconds (defaults to 60) */
  clockSkew?: number;
}

/**
 * Verifies a device-signed document according to ISO/IEC 18013-5.
 *
 * @description
 * This function performs comprehensive verification of a device-signed document, including:
 * 1. Extracts `docType`, `issuerSigned`, and `deviceSigned` from the document using {@link toDeviceSignedDocumentObject}.
 * 2. Verifies the issuer-signed structure using {@link verifyIssuerSigned}, which validates:
 *    - The issuer signature (IssuerAuth)
 *    - The Mobile Security Object (MSO)
 *    - The value digests
 *    - The validity information
 * 3. Extracts the device public key from the MSO using {@link toMobileSecurityObjectObject} and {@link toDeviceKeyInfoObject}.
 * 4. Converts the device COSE key to a JWK public key using {@link coseToJwkPublicKey}.
 * 5. Extracts `nameSpaces` and `deviceAuth` from the device-signed structure using {@link toDeviceSignedObject}.
 * 6. Extracts `deviceSignature` from the device authentication using {@link toDeviceAuthObject}.
 * 7. Converts the device signature (CBOR Tag 18) to a Sign1 instance using {@link toSign1}.
 * 8. Encodes the DeviceAuthentication structure using {@link encodeDeviceAuthentication}, which includes:
 *    - The session transcript
 *    - The document type
 *    - The device name spaces
 * 9. Verifies the COSE_Sign1 signature using the device public key and the detached payload.
 *
 * The function throws an error if any step fails, including missing required fields, invalid structures,
 * signature verification failure, or issuer verification failure.
 *
 * @param params - The parameters for verification.
 * @param params.deviceSignedDocument - The device-signed document to verify.
 * @param params.sessionTranscript - The session transcript tuple for DeviceAuthentication encoding.
 * @param params.now - The current time for evaluating validity dates (defaults to current time).
 * @param params.clockSkew - The acceptable clock skew in seconds (defaults to 60).
 *
 * @returns {void} This function does not return a value. It throws an error if verification fails.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `docType` is missing with code {@link MdocErrorCode.DocTypeMissing}.
 * Throws an error if `issuerSigned` is missing with code {@link MdocErrorCode.IssuerSignedMissing}.
 * Throws an error if `deviceSigned` is missing with code {@link MdocErrorCode.DeviceSignedMissing}.
 * Throws an error if issuer verification fails (see {@link verifyIssuerSigned} for error codes).
 * Throws an error if device signature verification fails (see {@link verifyDeviceSigned} for error codes).
 *
 * @throws {Error}
 * Throws an error if the detached payload is required but not provided.
 * Throws an error if signature verification fails.
 *
 * @see {@link toDeviceSignedDocumentObject} - For extracting document structure.
 * @see {@link verifyIssuerSigned} - For issuer-signed structure verification.
 * @see {@link toDeviceSignedObject} - For extracting device-signed structure.
 * @see {@link toDeviceAuthObject} - For extracting device authentication structure.
 * @see {@link toSign1} - For converting Tag 18 to Sign1 instance.
 * @see {@link encodeDeviceAuthentication} - For encoding DeviceAuthentication structure.
 * @see {@link coseToJwkPublicKey} - For converting COSE key to JWK public key.
 * @see {@link Sign1.verify} - For signature verification details.
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const deviceSignedDocument: Document = new Map([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedMap],
 *   ['deviceSigned', deviceSignedMap],
 * ]);
 * const sessionTranscript: SessionTranscript = [null, null, {}];
 *
 * try {
 *   verifyDeviceSignedDocument({
 *     deviceSignedDocument,
 *     sessionTranscript,
 *     now: new Date(),
 *     clockSkew: 60,
 *   });
 *   console.log('Device-signed document verification successful');
 * } catch (error) {
 *   console.error('Device-signed document verification failed:', error);
 * }
 * ```
 */
export const verifyDeviceSignedDocument = ({
  deviceSignedDocument,
  sessionTranscript,
  now = new Date(),
  clockSkew = 60,
}: VerifyDeviceSignedDocumentParams): void => {
  const { docType, issuerSigned, deviceSigned } =
    toDeviceSignedDocumentObject(deviceSignedDocument);

  const { mso } = verifyIssuerSigned({ issuerSigned, now, clockSkew });
  const { deviceKeyInfo } = toMobileSecurityObjectObject(mso);
  const { deviceKey } = toDeviceKeyInfoObject(deviceKeyInfo);
  const deviceJwkPublicKey = coseToJwkPublicKey(deviceKey);
  const { nameSpaces, deviceAuth } = toDeviceSignedObject(deviceSigned);
  const { deviceSignature } = toDeviceAuthObject(deviceAuth);
  const sign1 = toSign1(deviceSignature);
  const detachedPayload = encodeDeviceAuthentication({
    sessionTranscript,
    docType,
    nameSpacesBytes: nameSpaces,
  });
  sign1.verify(deviceJwkPublicKey, { detachedPayload });
};
