import { MSOVerifyHandlerImpl } from '../mso';
import { MdocVerifyHandler, MdocVerifyResult } from './MdocVerifyHandler';
import { parseMdocString } from './ParseMdocString';
import {
  createVerifyNameSpacesSchema,
  NameSpaceSchemas,
} from './VerifyNameSpacesSchema';

/**
 * Implementation of the MDOC verification handler
 * @description
 * A class that implements the MDOC verification process. It verifies both
 * the MSO signatures and the document schemas for each document in the MDOC.
 *
 * @example
 * ```typescript
 * const handler = new MdocVerifyHandlerImpl({
 *   'org.iso.18013.5.1.mDL': mDLNameSpaceSchema
 * });
 * const result = await handler.verify(mdocString);
 * ```
 */
export class MdocVerifyHandlerImpl implements MdocVerifyHandler {
  verify: (mdoc: string) => Promise<MdocVerifyResult>;

  /**
   * Creates a new MDOC verification handler
   * @param schemas - Optional schemas for validating document name spaces
   */
  constructor(schemas: NameSpaceSchemas = {}) {
    const msoVerifyHandler = new MSOVerifyHandlerImpl();
    const verifyNameSpacesSchema = createVerifyNameSpacesSchema({ schemas });
    this.verify = async (mdoc: string) => {
      try {
        const deviceResponse = parseMdocString(mdoc);
        if (!deviceResponse.documents) {
          throw new Error('No documents found');
        }
        for (const document of deviceResponse.documents) {
          const { issuerAuth, nameSpaces } = document.issuerSigned;
          await msoVerifyHandler.verify(issuerAuth, nameSpaces);
        }
        const nameSpaces = await verifyNameSpacesSchema(deviceResponse);

        return { valid: true, documents: nameSpaces };
      } catch (e) {
        console.error(e);
        return { valid: false };
      }
    };
  }
}
