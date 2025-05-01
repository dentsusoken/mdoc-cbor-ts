import { COSEKey } from '@auth0/cose';
import {
  DataElementIdentifier,
  DataElementValue,
  DocType,
  NameSpace,
} from '../../../schemas/common';
import { DeviceResponse } from '../../../schemas/mdoc';

/**
 * Type definition for name space data
 * @description
 * Represents a collection of data elements organized by name space.
 * Each name space contains a mapping of element identifiers to their values.
 */
export type NameSpaceData = Record<
  NameSpace,
  Record<DataElementIdentifier, DataElementValue>
>;

/**
 * Type definition for MDOC data
 * @description
 * Represents a collection of documents, where each document is identified
 * by its document type and contains name space data.
 */
export type MdocData = Record<DocType, NameSpaceData>;

/**
 * Interface for MDOC issue handler
 * @description
 * Defines the contract for MDOC issue handlers. The handler provides
 * a method to create MDOCs from the provided data and device key.
 */
export interface MdocIssueHandler {
  /**
   * Creates an MDOC from the provided data
   * @param data - The document data to include in the MDOC
   * @param deviceKey - The device's public key
   * @returns A Promise that resolves to the created DeviceResponse
   */
  issue: (data: MdocData, deviceKey: COSEKey) => Promise<DeviceResponse>;
}
