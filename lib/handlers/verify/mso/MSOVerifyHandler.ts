import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth } from '../../../schemas/mso';

/**
 * Interface for Mobile Security Object (MSO) verification handler
 * @description
 * Defines the contract for MSO verification handlers. The handler provides
 * a method to verify the issuer's authentication and name spaces in an MSO.
 */
export interface MSOVerifyHandler {
  /**
   * Verifies an MSO's issuer authentication and name spaces
   * @param issuerAuth - The issuer's authentication data
   * @param issuerNameSpaces - The issuer's name spaces containing document data
   * @returns A Promise that resolves to true if verification succeeds, false otherwise
   */
  verify: (
    issuerAuth: IssuerAuth,
    issuerNameSpaces: IssuerNameSpaces
  ) => Promise<boolean>;
}
