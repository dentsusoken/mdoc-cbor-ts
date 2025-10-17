import { formatMessage } from './formatMessage';
import { formatPath } from './formatPath';

/**
 * Creates an error message for a specific key's value validation failure within a container-like map or object.
 *
 * This utility helps format error messages by consistently prefixing them with the target container
 * and the path to the value that failed validation. It trims redundant path prefixes in the original
 * message, ensuring user-friendly error messages without duplication.
 *
 * @param target - The name of the target schema or container being validated (e.g., "Container" or "UserData").
 * @param path - An array representing the path to the nested key(s) that failed validation.
 *               Each element is a key string or number (e.g., ['addresses', 0, 'city']).
 * @param originalMessage - The original validation error message produced by the item's schema.
 * @returns A formatted error message string prefixed with the target and path, and the message.
 *
 * @example
 * // Example usage:
 * //   target = "UserProfile"
 * //   path = ["addresses", 0, "city"]
 * //   originalMessage = "City: Required"
 * // Returns: "UserProfile.addresses[0].city: Required"
 */
export const containerInvalidValueMessage = (
  target: string,
  path: (string | number)[],
  originalMessage?: string
): string => `${formatPath(target, path)}: ${formatMessage(originalMessage)}`;
