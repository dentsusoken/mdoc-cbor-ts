import { COSEKey } from '@auth0/cose';
import { Configuration } from '../../../conf/Configuration';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { MobileSecurityObject } from '../../../schemas/mso';
import { CreateBuilderFunction } from '../CreateBuilder';
import { BuildValidityInfo } from './BuildValidityInfo';
import { BuildValueDigests } from './BuildValueDigests';

/**
 * Type definition for building a Mobile Security Object
 * @description
 * A function that creates a Mobile Security Object (MSO) from the given parameters.
 * This function is asynchronous and returns a Promise that resolves to the created MSO.
 *
 * @param docType - The document type identifier
 * @param nameSpaces - The issuer's name spaces containing the document data
 * @param deviceKey - The COSE key used for device authentication
 * @returns A Promise that resolves to the created MobileSecurityObject
 */
export type BuildMobileSecurityObject = (
  docType: string,
  nameSpaces: IssuerNameSpaces,
  deviceKey: COSEKey
) => Promise<MobileSecurityObject>;

/**
 * Parameters for creating a Mobile Security Object builder
 * @description
 * Configuration and dependencies required to create a builder function
 * for Mobile Security Objects.
 */
export type CreateMobileSecurityObjectBuilderParams = {
  /** Configuration settings for the MSO */
  configuration: Configuration;
  /** Function to build value digests */
  buildValueDigests: BuildValueDigests;
  /** Function to build validity information */
  buildValidityInfo: BuildValidityInfo;
};

/**
 * Creates a builder function for Mobile Security Objects
 * @description
 * Returns a function that creates Mobile Security Objects using the provided
 * configuration and dependencies. The builder function handles the creation
 * of MSOs with proper versioning, digest algorithms, and validity information.
 *
 * @example
 * ```typescript
 * const builder = createMobileSecurityObjectBuilder({
 *   configuration,
 *   buildValueDigests,
 *   buildValidityInfo
 * });
 *
 * const mso = await builder('org.iso.18013.5.1.mDL', nameSpaces, deviceKey);
 * ```
 */
export const createMobileSecurityObjectBuilder: CreateBuilderFunction<
  CreateMobileSecurityObjectBuilderParams,
  BuildMobileSecurityObject
> =
  ({ configuration, buildValueDigests, buildValidityInfo }) =>
  async (docType: string, nameSpaces: IssuerNameSpaces, deviceKey: COSEKey) => {
    const mso: MobileSecurityObject = {
      docType,
      version: '1.0',
      digestAlgorithm: configuration.digestAlgorithm,
      valueDigests: await buildValueDigests(
        nameSpaces,
        configuration.digestAlgorithm
      ),
      validityInfo: buildValidityInfo(),
      deviceKeyInfo: {
        // TODO: encoderを変えてMapをObjectにする
        deviceKey: Object.fromEntries(deviceKey.entries()),
      },
    };
    return mso;
  };
