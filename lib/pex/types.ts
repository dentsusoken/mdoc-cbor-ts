/**
 * Describes a filter object used within a PresentationDefinitionField.
 * Follows the JSON Schema filter style for constraints.
 */
export interface PresentationDefinitionFieldFilter {
  /** The type of value to match, e.g. "string", "number", etc. */
  type?: string;
  /** A constant value required for the field (exact value match for filtering). */
  const?: unknown;
}

/**
 * Specifies a field required by an input descriptor, including its path and intent-to-retain flag.
 */
export interface PresentationDefinitionField {
  /**
   * The path targeting the field in the credential, following a JSONPath-style string array.
   * Example: ["$['org.iso.18013.5.1']['given_name']"]
   */
  path: string[];

  /**
   * Flag indicating whether this value should be retained by the verifier even after presentation
   * (per Presentation Exchange "intent_to_retain").
   */
  /**
   * Flag indicating whether this value should be retained by the verifier even after presentation
   * (per Presentation Exchange "intent_to_retain").
   * Defaults to false if not specified.
   */
  intent_to_retain?: boolean;

  /**
   * Optional filter object specifying value constraints for the field (using JSON Schema-like syntax).
   * If provided, the field value must satisfy these constraints.
   */
  filter?: PresentationDefinitionFieldFilter;

  /**
   * Indicates whether this field is optional within the input descriptor.
   * If true, the field is not required to be present for the input to match.
   * Defaults to false if not specified.
   */
  optional?: boolean;
}

/**
 * Specifies the supported cryptographic proof formats for a credential.
 */
export interface Format {
  /**
   * Mobile Security Object for mdoc profile; specifies allowed signature algorithms.
   */
  mso_mdoc: {
    /**
     * List of accepted algorithms, e.g. ["ES256"].
     */
    alg: string[];
  };
}

/**
 * Describes an input descriptor within a presentation definition, specifying requirements for credentials to be admitted.
 */
export interface InputDescriptor {
  /** Unique identifier for this input descriptor. */
  id: string;
  /** Supported format and algorithms for the credential proof. */
  format: Format;
  /** Constraints limiting the structure and fields of input credentials. */
  constraints: {
    /** Level of selective disclosure permitted. E.g., "required", "preferred". */
    limit_disclosure?: string;
    /**
     * Fields required for this input descriptor: each specifies a field path and retention flag.
     */
    fields: PresentationDefinitionField[];
  };
}

/**
 * A PresentationDefinition specifies all requirements for a set of input credentials to satisfy a verifier's request.
 */
export interface PresentationDefinition {
  /** A unique identifier for the presentation definition. */
  id: string;
  /** The array of input descriptors, each describing a required credential or attribute constraint. */
  input_descriptors: InputDescriptor[];
}
