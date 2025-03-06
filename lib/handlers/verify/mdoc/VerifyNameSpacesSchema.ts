import { z } from 'zod';
import { DeviceResponse } from '../../../schemas/mdoc';
import { CreateBuilderFunction } from '../../issue/CreateBuilder';
import { ValidDocuments } from './MdocVerifyHandler';

export type NameSpaceSchemas = {
  [nameSpace: string]: z.ZodObject<z.ZodRawShape>;
};

export type VerifyNameSpacesSchema = (
  deviceResponse: DeviceResponse
) => Promise<ValidDocuments>;

export type NameSpacesSchemaVerifierParams = {
  schemas: NameSpaceSchemas;
};

export type CreateVerifyNameSpacesSchema = CreateBuilderFunction<
  NameSpacesSchemaVerifierParams,
  VerifyNameSpacesSchema
>;

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
          validDocuments[docType][nameSpace][element.data.elementIdentifier] =
            element.data.elementValue;
        });
        if (!(nameSpace in schemas)) {
          // TODO: should error or ignore?
          //   throw new Error(`Schema for nameSpace ${nameSpace} not found`);
          continue;
        }
        const schema = schemas[nameSpace].partial();
        validDocuments[docType][nameSpace] = schema.parse(
          validDocuments[docType][nameSpace]
        );
      }
    }
    return validDocuments;
  };
