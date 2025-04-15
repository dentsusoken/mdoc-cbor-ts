import { TypedMap } from '@jfromaniello/typedmap';
import { Tag } from 'cbor-x';
import crypto from 'crypto';
import { ByteString } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import {
  IssuerNameSpaces,
  IssuerSignedItem,
  IssuerSignedItemBytes,
} from '../../../schemas/mdoc';
import { KVMap } from '../../../types';
import { CreateBuilderFunction } from '../CreateBuilder';
import { NameSpaceData } from './MdocIssueHandler';

/**
 * Type definition for building issuer name spaces
 * @description
 * A function type that creates issuer name spaces from the provided data.
 * The function processes each name space and its elements, creating
 * signed items with random values and digest IDs.
 */
export type BuildIssuerNameSpaces = (data: NameSpaceData) => IssuerNameSpaces;

/**
 * Parameters for creating an issuer name spaces builder
 * @description
 * Configuration required to create a builder function for issuer name spaces.
 */
export type CreateIssuerNameSpacesBuilderParams = {
  /** Configuration settings for validity periods and tag elements */
  configuration: Configuration;
};

/**
 * Creates a function for building issuer name spaces
 * @description
 * Returns a function that creates issuer name spaces from the provided data.
 * The function processes each name space and its elements, creating
 * signed items with random values and digest IDs. It also applies
 * appropriate tags to element values based on configuration.
 *
 * @example
 * ```typescript
 * const builder = createIssuerNameSpacesBuilder({
 *   configuration
 * });
 * const nameSpaces = builder(data);
 * ```
 */
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
        // TODO: NameSpaceDataの時点でtagを適用（addExtension）するようにする。
        if (!!configuration.tagElements[elementIdentifier]) {
          const tag = new Tag(
            elementValue,
            configuration.tagElements[elementIdentifier]
          );
          elementValue = tag;
        }
        issuerSignedItems.push(
          new ByteString(
            new TypedMap<KVMap<IssuerSignedItem>>([
              ['random', random],
              ['digestID', digestID],
              ['elementIdentifier', elementIdentifier],
              ['elementValue', elementValue],
            ])
          )
        );
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
