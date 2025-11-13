import { Document } from '@/schemas/mdoc/Document';
import {
  IssuerSignedObject,
  toIssuerSignedObject,
} from './toIssuerSignedObject';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

export interface IssuerSignedDocumentObject {
  docType: string;
  issuerSigned: IssuerSignedObject;
}

export const toIssuerSignedDocumentObject = (
  document: Document
): IssuerSignedDocumentObject => {
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

  return {
    docType,
    issuerSigned: toIssuerSignedObject(issuerSigned),
  };
};
