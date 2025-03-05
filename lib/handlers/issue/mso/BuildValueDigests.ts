import crypto from 'crypto';
import { Buffer } from 'node:buffer';
import { encode } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { DigestAlgorithm, ValueDigests } from '../../../schemas/mso';
import { CreateBuilderFunction } from '../CreateBuilder';

/**
 * Type definition for building value digests
 * @description
 * A function that creates value digests for each element in the name spaces.
 * This function is asynchronous and returns a Promise that resolves to the created ValueDigests.
 *
 * @param nameSpaces - The issuer's name spaces containing the document data
 * @param digestAlgorithm - The algorithm to use for creating digests
 * @returns A Promise that resolves to the created ValueDigests
 */
export type BuildValueDigests = (
  nameSpaces: IssuerNameSpaces,
  digestAlgorithm: DigestAlgorithm
) => Promise<ValueDigests>;

/**
 * Parameters for creating a value digests builder
 * @description
 * Configuration required to create a builder function for value digests.
 */
export type CreateValueDigestsBuilderParams = {
  /** Configuration settings for digest algorithm */
  configuration: Configuration;
};

/**
 * Creates a builder function for value digests
 * @description
 * Returns a function that creates value digests for each element in the name spaces.
 * The builder function handles the creation of digests using the specified algorithm
 * and encodes the data using CBOR before creating the digest.
 *
 * @example
 * ```typescript
 * const builder = createValueDigestsBuilder({
 *   configuration
 * });
 *
 * const valueDigests = await builder(nameSpaces, 'SHA-256');
 * ```
 */
export const createValueDigestsBuilder: CreateBuilderFunction<
  CreateValueDigestsBuilderParams,
  BuildValueDigests
> =
  ({ configuration }) =>
  async (nameSpaces) => {
    if (!nameSpaces || Object.keys(nameSpaces).length === 0) {
      throw new Error('NameSpaces are required');
    }

    const valueDigests: ValueDigests = {};

    for (const [namespace, elements] of Object.entries(nameSpaces)) {
      valueDigests[namespace] = {};
      for (const element of elements) {
        valueDigests[namespace][element.data.digestID] = Buffer.from(
          await crypto.subtle.digest(
            configuration.digestAlgorithm,
            encode(element)
          )
        );
      }
    }

    return valueDigests;
  };
