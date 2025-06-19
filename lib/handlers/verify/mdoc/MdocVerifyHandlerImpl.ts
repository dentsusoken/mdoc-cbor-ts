import { MSOVerifyHandlerImpl } from '../mso';
import { MdocVerifyHandler, MdocVerifyResult } from './MdocVerifyHandler';
import { parseMdocString as defaultParseMdocString } from './ParseMdocString';
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
  constructor(
    schemas: NameSpaceSchemas = {},
    parseMdocString = defaultParseMdocString
  ) {
    const msoVerifyHandler = new MSOVerifyHandlerImpl();
    const verifyNameSpacesSchema = createVerifyNameSpacesSchema({ schemas });
    this.verify = async (mdoc: string) => {
      const parsed = parseMdocString(mdoc);
      // DeviceResponse
      if ('documents' in parsed && Array.isArray(parsed.documents)) {
        for (const document of parsed.documents) {
          const { issuerAuth, nameSpaces } = document.issuerSigned;
          await msoVerifyHandler.verify(issuerAuth, nameSpaces);
        }
        const nameSpaces = await verifyNameSpacesSchema(parsed);
        return { valid: true, documents: nameSpaces };
      }

      // IssuerSigned
      if ('issuerAuth' in parsed && 'nameSpaces' in parsed) {
        if (parsed.issuerAuth) {
          await msoVerifyHandler.verify(parsed.issuerAuth, parsed.nameSpaces);
        }
        const validated = Object.fromEntries(
          Object.entries(parsed.nameSpaces).map(([ns, elements]) => {
            const schema = schemas[ns];
            if (schema) {
              schema
                .partial()
                .strict()
                .parse(
                  Object.fromEntries(
                    elements.map((e) => [
                      e.data.get('elementIdentifier'),
                      e.data.get('elementValue'),
                    ])
                  )
                );
            }
            return [ns, elements];
          })
        );
        return { valid: true, documents: validated };
      }

      throw new Error('Invalid MDOC format');
    };
  }
}
