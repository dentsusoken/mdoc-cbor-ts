import { Document } from '@/schemas/mdoc/Document';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';

/**
 * Plain object representation for extracted device-signed document data.
 *
 * @description
 * This object type contains the essential extracted values from a `Document` structure:
 * - `docType`: The document type string (e.g., "org.iso.18013.5.1.mDL").
 * - `issuerSigned`: The issuer-signed structure containing nameSpaces and issuerAuth.
 * - `deviceSigned`: The device-signed structure containing nameSpaces and deviceAuth.
 *
 * @property docType - The document type string extracted from the Document map.
 * @property issuerSigned - The issuer-signed structure (IssuerSigned Map) extracted from the Document map.
 * @property deviceSigned - The device-signed structure (DeviceSigned Map) extracted from the Document map.
 *
 * @see Document
 * @see IssuerSigned
 * @see DeviceSigned
 */
export interface DeviceSignedDocumentObject {
  /** The document type string extracted from the Document map. */
  docType: string;
  /** The issuer-signed structure extracted from the Document map. */
  issuerSigned: IssuerSigned;
  /** The device-signed structure extracted from the Document map. */
  deviceSigned: DeviceSigned;
}

/**
 * Converts a Document Map structure to a plain object.
 *
 * @description
 * Extracts the `docType`, `issuerSigned`, and `deviceSigned` fields from a `Document` Map
 * and returns them as a plain object. This function performs validation to ensure
 * all required fields are present in the input structure.
 *
 * @param document - The Document Map structure containing docType, issuerSigned, and deviceSigned.
 * @returns An object containing the extracted docType, issuerSigned, and deviceSigned.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `docType` is missing with code {@link MdocErrorCode.DocTypeMissing}.
 * Throws an error if `issuerSigned` is missing with code {@link MdocErrorCode.IssuerSignedMissing}.
 * Throws an error if `deviceSigned` is missing with code {@link MdocErrorCode.DeviceSignedMissing}.
 *
 * @see {@link Document}
 * @see {@link IssuerSigned}
 * @see {@link DeviceSigned}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const document: Document = new Map([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedMap],
 *   ['deviceSigned', deviceSignedMap],
 * ]);
 * const result = toDeviceSignedDocumentObject(document);
 * // result.docType, result.issuerSigned, and result.deviceSigned are now available as plain object properties
 * ```
 */
export const toDeviceSignedDocumentObject = (
  document: Document
): DeviceSignedDocumentObject => {
  const docType = document.get('docType');
  if (!docType) {
    throw new ErrorCodeError(
      'The document type is missing.',
      MdocErrorCode.DocTypeMissing
    );
  }

  const issuerSigned = document.get('issuerSigned');
  if (!issuerSigned) {
    throw new ErrorCodeError(
      'The issuer-signed structure is missing.',
      MdocErrorCode.IssuerSignedMissing
    );
  }

  const deviceSigned = document.get('deviceSigned');
  if (!deviceSigned) {
    throw new ErrorCodeError(
      'The device-signed structure is missing.',
      MdocErrorCode.DeviceSignedMissing
    );
  }

  return {
    docType,
    issuerSigned,
    deviceSigned,
  };
};
