import { COSEKey } from '@auth0/cose';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth } from '../../../schemas/mso';

export interface MSOIssueHandler {
  issue: (
    docType: string,
    nameSpaces: IssuerNameSpaces,
    deviceKey: COSEKey
  ) => Promise<IssuerAuth>;
}
