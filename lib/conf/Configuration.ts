import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';

/**
 * Configuration options for Mobile Security Object (MSO)
 * @description
 * Defines the configuration options for creating and managing MSOs.
 * All fields are optional and have default values where applicable.
 */
export type MSOConfigurationOptions = {
  /** The digest algorithm to use for hashing (default: 'SHA-256') */
  digestAlgorithm?: DigestAlgorithm;
  /** The validity start time in milliseconds (default: 0) */
  validFrom?: number;
  /** The validity end time in milliseconds (default: 1 year) */
  validUntil?: number;
  /** The expected update time in milliseconds (optional) */
  expectedUpdate?: number;
};

export type TagElements = Record<string, number>;

export type ConfigurationOptions = MSOConfigurationOptions & {
  tagElements?: TagElements;
};

/**
 * Default validity start time
 * @description
 * Represents the current time (0 milliseconds from epoch)
 */
const DEFAULT_VALID_FROM = 0;

/**
 * Default validity duration
 * @description
 * Represents one year in milliseconds (365 days)
 */
const DEFAULT_VALID_UNTIL = 365 * 24 * 60 * 60 * 1000;

const DEFAULT_TAG_ELEMENTS: TagElements = {
  birth_date: 1004,
  expiry_date: 1004,
  issue_date: 1004,
};

/**
 * Configuration class for managing MSO settings
 * @description
 * Handles the configuration options for Mobile Security Objects,
 * providing default values and type safety for all settings.
 *
 * @example
 * ```typescript
 * const config = new Configuration({
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: Date.now(),
 *   validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000
 * });
 * ```
 */
export class Configuration {
  #options: ConfigurationOptions;

  /**
   * Creates a new Configuration instance
   * @param options - Configuration options for the MSO
   */
  constructor(options: ConfigurationOptions) {
    this.#options = options;
  }

  /**
   * Gets the configured digest algorithm
   * @returns The digest algorithm (default: 'SHA-256')
   */
  get digestAlgorithm(): DigestAlgorithm {
    return this.#options.digestAlgorithm ?? 'SHA-256';
  }

  /**
   * Gets the validity start time
   * @returns The validity start time in milliseconds (default: 0)
   */
  get validFrom(): number {
    return this.#options.validFrom ?? DEFAULT_VALID_FROM;
  }

  /**
   * Gets the validity end time
   * @returns The validity end time in milliseconds (default: 1 year)
   */
  get validUntil(): number {
    return this.#options.validUntil ?? DEFAULT_VALID_UNTIL;
  }

  /**
   * Gets the expected update time
   * @returns The expected update time in milliseconds (optional)
   */
  get expectedUpdate(): number | undefined {
    return this.#options.expectedUpdate;
  }

  /**
   * Gets the configured tag elements mapping
   * @description
   * Returns a mapping of element names to their CBOR tag numbers.
   * If no custom mapping is provided, returns the default mapping.
   * Custom mappings are merged with defaults, with custom values taking precedence.
   *
   * @returns The tag elements mapping
   */
  get tagElements(): TagElements {
    return this.#options.tagElements
      ? { ...DEFAULT_TAG_ELEMENTS, ...this.#options.tagElements }
      : DEFAULT_TAG_ELEMENTS;
  }
}
