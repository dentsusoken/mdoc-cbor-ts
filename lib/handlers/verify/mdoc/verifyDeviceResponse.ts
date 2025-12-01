import { SessionTranscript } from '@/mdoc/types';
import { Mdoc } from '@/schemas/mdoc/Mdoc';
import { verifyDeviceSignedDocument } from '@/handlers';

/**
 * Parameters for verifying a device response (mdoc).
 */
interface VerifyDeviceResponseParams {
  /** The device response (mdoc) structure containing documents to verify */
  deviceResponse: Mdoc;
  /** The session transcript tuple [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover] */
  sessionTranscript: SessionTranscript;
  /** The current date and time for evaluating validity dates (defaults to current time) */
  now?: Date;
  /** Acceptable clock skew in seconds (defaults to 60) */
  clockSkew?: number;
}

/**
 * Verifies a device response (mdoc) according to ISO/IEC 18013-5.
 *
 * @description
 * This function verifies all device-signed documents contained in a device response (mdoc) structure.
 * It iterates through the `documents` array in the mdoc and verifies each document using
 * {@link verifyDeviceSignedDocument}, which performs comprehensive verification including:
 * - Issuer signature verification
 * - Mobile Security Object (MSO) validation
 * - Value digests validation
 * - Validity information validation
 * - Device signature verification
 *
 * The function throws an error if any document verification fails. All documents in the mdoc
 * must pass verification for the function to complete successfully.
 *
 * @param params - The parameters for verification.
 * @param params.deviceResponse - The device response (mdoc) structure containing documents to verify.
 * @param params.sessionTranscript - The session transcript tuple for DeviceAuthentication encoding.
 * @param params.now - The current time for evaluating validity dates (defaults to current time).
 * @param params.clockSkew - The acceptable clock skew in seconds (defaults to 60).
 *
 * @returns {void} This function does not return a value. It throws an error if verification fails.
 *
 * @throws {ErrorCodeError}
 * Throws an error if any document verification fails (see {@link verifyDeviceSignedDocument} for error codes).
 *
 * @throws {Error}
 * Throws an error if the mdoc structure is invalid or if any document verification fails.
 *
 * @see {@link verifyDeviceSignedDocument} - For individual document verification details.
 * @see {@link Mdoc} - For mdoc structure details.
 * @see {@link SessionTranscript} - For session transcript structure.
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const deviceResponse: Mdoc = new Map([
 *   ['version', '1.0'],
 *   ['documents', [document1, document2]],
 *   ['documentErrors', []],
 *   ['status', MdocStatus.OK],
 * ]);
 * const sessionTranscript: SessionTranscript = [null, null, {}];
 *
 * try {
 *   verifyDeviceResponse({
 *     deviceResponse,
 *     sessionTranscript,
 *     now: new Date(),
 *     clockSkew: 60,
 *   });
 *   console.log('Device response verification successful');
 * } catch (error) {
 *   console.error('Device response verification failed:', error);
 * }
 * ```
 */
export const verifyDeviceResponse = ({
  deviceResponse,
  sessionTranscript,
  now = new Date(),
  clockSkew = 60,
}: VerifyDeviceResponseParams): void => {
  const documents = deviceResponse.get('documents') || [];

  documents.forEach((document) => {
    verifyDeviceSignedDocument({
      deviceSignedDocument: document,
      sessionTranscript,
      now,
      clockSkew,
    });
  });
};
