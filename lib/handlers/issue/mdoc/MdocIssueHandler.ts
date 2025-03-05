import { COSEKey } from '@auth0/cose';
import {
  DataElementIdentifier,
  DataElementValue,
  DocType,
  NameSpace,
} from '../../../schemas/common';
import { DeviceResponse } from '../../../schemas/mdoc';

export type NameSpaceData = Record<
  NameSpace,
  Record<DataElementIdentifier, DataElementValue>
>;

export type MdocData = Record<DocType, NameSpaceData>;

export interface MdocIssueHandler {
  issue: (data: MdocData, deviceKey: COSEKey) => Promise<DeviceResponse>;
}
