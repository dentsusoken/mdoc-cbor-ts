import { z } from 'zod';
import { DeviceResponse } from '../../../schemas/mdoc';
import { CreateBuilderFunction } from '../../issue/CreateBuilder';
import { ValidDocuments } from './MdocVerifyHandler';

/**
 * Type definition for name space validation schemas
 * @description
 * A collection of Zod schemas for validating document name spaces.
 * Each name space has its own schema that defines the structure and
 * validation rules for its elements.
 */
export type NameSpaceSchemas = {
  [nameSpace: string]: z.ZodObject<z.ZodRawShape>;
};

/**
 * Type definition for name space schema verification
 * @description
 * A function that verifies document name spaces against their corresponding
 * schemas and returns the validated documents.
 */
export type VerifyNameSpacesSchema = (
  deviceResponse: DeviceResponse
) => Promise<ValidDocuments>;

/**
 * Parameters for creating a name space schema verifier
 * @description
 * Configuration required to create a verifier function for name space schemas.
 */
export type NameSpacesSchemaVerifierParams = {
  /** Schemas for validating document name spaces */
  schemas: NameSpaceSchemas;
};

/**
 * Type definition for creating a name space schema verifier
 * @description
 * A function type that creates a verifier function for validating document
 * name spaces against their schemas.
 */
export type CreateVerifyNameSpacesSchema = CreateBuilderFunction<
  NameSpacesSchemaVerifierParams,
  VerifyNameSpacesSchema
>;

/**
 * Creates a function for verifying name space schemas
 * @description
 * Returns a function that validates document name spaces against their
 * corresponding schemas. The function processes each document and its
 * name spaces, applying the appropriate schema validation.
 *
 * @example
 * ```typescript
 * const verifier = createVerifyNameSpacesSchema({
 *   schemas: {
 *     'org.iso.18013.5.1.mDL': mDLNameSpaceSchema
 *   }
 * });
 * const validDocuments = await verifier(deviceResponse);
 * ```
 */
export const createVerifyNameSpacesSchema: CreateVerifyNameSpacesSchema =
  ({ schemas }) =>
  async (deviceResponse) => {
    const validDocuments: ValidDocuments = {};
    if (!deviceResponse.documents) {
      throw new Error('No documents found');
    }
    for (const document of deviceResponse.documents) {
      const docType = document.docType;
      const nameSpaces = document.issuerSigned.nameSpaces;

      validDocuments[docType] = {};

      for (const [nameSpace, elements] of Object.entries(nameSpaces)) {
        validDocuments[docType][nameSpace] = {};
        elements.forEach((element) => {
          const id = element.data.get('elementIdentifier');
          const value = element.data.get('elementValue');
          validDocuments[docType][nameSpace][id!] = value;
        });
        if (!(nameSpace in schemas)) {
          // TODO: should error or ignore?
          //   throw new Error(`Schema for nameSpace ${nameSpace} not found`);
          continue;
        }
        const schema = schemas[nameSpace].partial().strict();
        schema.parse(validDocuments[docType][nameSpace]);
      }
    }
    return validDocuments;
  };
