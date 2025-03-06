import { MSOVerifyHandlerImpl } from '../mso';
import { MdocVerifyHandler, MdocVerifyResult } from './MdocVerifyHandler';
import { parseMdocString } from './ParseMdocString';
import {
  createVerifyNameSpacesSchema,
  NameSpaceSchemas,
} from './VerifyNameSpacesSchema';

export class MdocVerifyHandlerImpl implements MdocVerifyHandler {
  verify: (mdoc: string) => Promise<MdocVerifyResult>;

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
        const documents = await verifyNameSpacesSchema(deviceResponse);

        return { valid: true, documents };
      } catch (e) {
        console.error(e);
        return { valid: false };
      }
    };
  }
}
