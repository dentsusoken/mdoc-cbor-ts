import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';

/**
 * Parameters for calculating WebAPI session transcript bytes.
 */
export type CalculateWebApiSessionTranscriptBytesParams = {
  /**
   * The device engagement bytes (raw bytes, NOT CBOR-encoded).
   * These bytes will be wrapped with Tag 24 inside this function to create DeviceEngagementBytes.
   * Note: Despite the parameter name ending in "Cbor", pass raw bytes, not CBOR-encoded data.
   */
  deviceEngagementCbor: Uint8Array;
  /**
   * The reader engagement bytes (raw bytes).
   * This is used as-is for Handover in the SessionTranscript.
   * In ISO 18013-7 Web API context, Handover is typically the ReaderEngagement bytes.
   */
  readerEngagementCbor: Uint8Array;
  /**
   * The ephemeral reader key bytes (raw bytes, NOT CBOR-encoded).
   * These bytes will be wrapped with Tag 24 inside this function to create EReaderKeyBytes.
   * Note: Despite the parameter name ending in "Cbor", pass raw bytes, not CBOR-encoded data.
   */
  eReaderKeyCbor: Uint8Array;
};

/**
 * Calculates the session transcript bytes for WebAPI handover.
 *
 * According to ISO 18013-5:
 * ```
 * SessionTranscript = #6.24(bstr .cbor [
 *   DeviceEngagementBytes,
 *   EReaderKeyBytes,
 *   Handover
 * ])
 *
 * DeviceEngagementBytes = #6.24(bstr .cbor DeviceEngagement)
 * EReaderKeyBytes = #6.24(bstr .cbor EReaderKey)
 * ```
 *
 * This function takes pre-encoded CBOR bytes (without Tag 24) and constructs
 * the SessionTranscript by:
 * 1. Wrapping deviceEngagementCbor with Tag 24 to create DeviceEngagementBytes
 * 2. Wrapping eReaderKeyCbor with Tag 24 to create EReaderKeyBytes
 * 3. Using readerEngagementCbor as-is for the Handover
 * 4. CBOR-encoding the array and wrapping it with Tag 24 (via createTag24)
 *
 * @param params - The parameters required to construct the WebAPI session transcript.
 * @returns The encoded session transcript as a Uint8Array.
 */
export const calculateWebApiSessionTranscriptBytes = ({
  deviceEngagementCbor,
  readerEngagementCbor,
  eReaderKeyCbor,
}: CalculateWebApiSessionTranscriptBytesParams): Uint8Array =>
  encodeCbor(
    createTag24([
      new Tag(deviceEngagementCbor, 24), // DeviceEngagementBytes
      new Tag(eReaderKeyCbor, 24), // EReaderKeyBytes
      readerEngagementCbor, // Handover (ReaderEngagementBytes in Web API context)
    ])
  );
