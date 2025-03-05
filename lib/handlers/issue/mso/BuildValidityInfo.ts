import { DateTime } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { ValidityInfo } from '../../../schemas/mso';
import { CreateBuilderFunction } from '../CreateBuilder';

/**
 * Type definition for building validity information
 * @description
 * A function that creates validity information for a Mobile Security Object.
 * This function returns the validity period information including signed date,
 * valid from date, valid until date, and optional expected update date.
 *
 * @returns The created ValidityInfo object
 */
export type BuildValidityInfo = () => ValidityInfo;

/**
 * Parameters for creating a validity info builder
 * @description
 * Configuration required to create a builder function for validity information.
 */
export type CreateValidityInfoBuilderParams = {
  /** Configuration settings for validity periods */
  configuration: Configuration;
};

/**
 * Creates a builder function for validity information
 * @description
 * Returns a function that creates validity information using the provided
 * configuration. The builder function handles the creation of validity periods
 * including signed date, valid from date, valid until date, and optional
 * expected update date.
 *
 * @example
 * ```typescript
 * const builder = createValidityInfoBuilder({
 *   configuration
 * });
 *
 * const validityInfo = builder();
 * ```
 */
export const createValidityInfoBuilder: CreateBuilderFunction<
  CreateValidityInfoBuilderParams,
  BuildValidityInfo
> = ({ configuration }) => {
  return () => {
    const { validFrom, validUntil, expectedUpdate } = configuration;
    const now = DateTime.now();

    return expectedUpdate
      ? {
          signed: new DateTime(now),
          validFrom: new DateTime(now + validFrom),
          validUntil: new DateTime(now + validUntil),
          expectedUpdate: new DateTime(now + expectedUpdate),
        }
      : {
          signed: new DateTime(now),
          validFrom: new DateTime(now + validFrom),
          validUntil: new DateTime(now + validUntil),
        };
  };
};
