/**
 * Type definition for a valid name space structure
 * @description
 * Represents a validated name space containing element identifiers and their values.
 * The structure is a nested object where the outer key is the name space identifier
 * and the inner keys are element identifiers.
 */
export type ValidNameSpace = {
  [nameSpace: string]: {
    [elementIdentifier: string]: unknown;
  };
};

/**
 * Type definition for valid documents
 * @description
 * Represents a collection of validated documents, where each document is identified
 * by its document type and contains validated name spaces.
 */
export type ValidDocuments = {
  [docType: string]: ValidNameSpace;
};

/**
 * Type definition for MDOC verification result
 * @description
 * Represents the result of MDOC verification. If verification is successful,
 * includes the validated documents. If verification fails, only includes the
 * valid flag set to false.
 */
export type MdocVerifyResult =
  | { valid: true; documents: ValidDocuments }
  | { valid: false };

/**
 * Interface for MDOC verification handler
 * @description
 * Defines the contract for MDOC verification handlers. The handler provides
 * a method to verify MDOC strings and return the verification result.
 */
export interface MdocVerifyHandler {
  /**
   * Verifies an MDOC string
   * @param mdoc - The MDOC string to verify
   * @returns A Promise that resolves to the verification result
   */
  verify: (mdoc: string) => Promise<MdocVerifyResult>;
}
