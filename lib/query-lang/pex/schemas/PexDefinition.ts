import { z } from 'zod';
import { pexInputDescriptorSchema } from './PexInputDescriptor';

/**
 * Zod schema for a Presentation Exchange Definition.
 *
 * A Presentation Definition describes the structure and requirements for verifiable credentials
 * that a verifier (relying party) expects from a holder (user) in a presentation exchange flow.
 *
 * Properties:
 * - `id` (string): **Required.** A unique identifier for this presentation definition.
 * - `input_descriptors` (array): **Required.** An array of input descriptors (see {@link pexInputDescriptorSchema})
 *   that specify which credentials are required and what claims must be included. Must contain at least one descriptor.
 *
 * @see https://identity.foundation/presentation-exchange/#presentation-definition
 */
export const pexDefinitionSchema = z.object({
  /**
   * Unique identifier for this presentation definition.
   * Used to reference and track the definition throughout the exchange process.
   */
  id: z.string(),
  /**
   * Array of input descriptors that specify credential and claim requirements.
   * Must contain at least one descriptor.
   * See {@link pexInputDescriptorSchema} for descriptor details.
   */
  input_descriptors: z.array(pexInputDescriptorSchema).min(1),
});

/**
 * Type representing a Presentation Exchange Definition, as inferred from {@link pexDefinitionSchema}.
 */
export type PexDefinition = z.infer<typeof pexDefinitionSchema>;
