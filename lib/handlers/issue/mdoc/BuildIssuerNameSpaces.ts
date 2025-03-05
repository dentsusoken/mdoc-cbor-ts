import { Tag } from 'cbor-x';
import crypto from 'crypto';
import { ByteString } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import {
  IssuerNameSpaces,
  IssuerSignedItem,
  IssuerSignedItemBytes,
} from '../../../schemas/mdoc';
import { CreateBuilderFunction } from '../CreateBuilder';
import { NameSpaceData } from './MdocIssueHandler';

export type BuildIssuerNameSpaces = (data: NameSpaceData) => IssuerNameSpaces;

export type CreateIssuerNameSpacesBuilderParams = {
  /** Configuration settings for validity periods */
  configuration: Configuration;
};

export const createIssuerNameSpacesBuilder: CreateBuilderFunction<
  CreateIssuerNameSpacesBuilderParams,
  BuildIssuerNameSpaces
> =
  ({ configuration }) =>
  (data) => {
    const issuerNameSpaces: IssuerNameSpaces = {};
    // TODO: Documentごとに0から始まっていいのか、それとも前のDocumentのdigestIDを引き継ぐのか
    let digestID = 0;
    Object.entries(data).forEach(([nameSpace, elements]) => {
      const issuerSignedItems: IssuerSignedItemBytes[] = [];
      // TODO: elementsの順番をランダムにする。
      Object.entries(elements).forEach(([elementIdentifier, elementValue]) => {
        const random = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
        if (!!configuration.tagElements[elementIdentifier]) {
          const tag = new Tag(
            elementValue,
            configuration.tagElements[elementIdentifier]
          );
          elementValue = tag;
        }
        const issuerSignedItem: IssuerSignedItem = {
          random,
          digestID,
          elementIdentifier,
          elementValue,
        };
        issuerSignedItems.push(new ByteString(issuerSignedItem));
        digestID++;
      });
      if (issuerSignedItems.length === 0) {
        throw new Error(`No issuer signed items for namespace ${nameSpace}`);
      }
      issuerNameSpaces[nameSpace] = issuerSignedItems as [
        IssuerSignedItemBytes,
        ...IssuerSignedItemBytes[],
      ];
    });
    return issuerNameSpaces;
  };
