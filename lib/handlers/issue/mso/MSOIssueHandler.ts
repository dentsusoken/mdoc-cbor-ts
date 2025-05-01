import { COSEKey } from '@auth0/cose';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth } from '../../../schemas/mso';

/**
 * Interface for Mobile Security Object (MSO) issue handler
 * @description
 * Defines the contract for MSO issue handlers. The handler provides
 * a method to create Mobile Security Objects with issuer authentication
 * for the specified document type and name spaces.
 */
export interface MSOIssueHandler {
  /**
   * Creates a Mobile Security Object with issuer authentication
   * @param docType - The document type identifier
   * @param nameSpaces - The issuer's name spaces containing document data
   * @param deviceKey - The device's public key
   * @returns A Promise that resolves to the created IssuerAuth
   */
  issue: (
    docType: string,
    nameSpaces: IssuerNameSpaces,
    deviceKey: COSEKey
  ) => Promise<IssuerAuth>;
}
