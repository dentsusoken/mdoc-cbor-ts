import { PresentationDefinitionFieldFilter } from './types';
import { validateSchemaType } from './validateSchemaType';

/**
 * Checks if a value matches a given PresentationDefinitionFieldFilter.
 *
 * @param filter - The filter object with optional 'type' and 'const' constraints.
 * @param value - The value to test against the filter.
 * @returns True if the value matches the filter constraints, false otherwise.
 *
 * @example
 * matchesFilter({ type: 'string' }, 'foo'); // true
 * matchesFilter({ const: 42 }, 42); // true
 * matchesFilter({ type: 'number', const: 42 }, 43); // false
 */
export const matchesFilter = (
  filter: PresentationDefinitionFieldFilter,
  value: unknown
): boolean => {
  if (filter.type && !validateSchemaType(filter.type, value)) {
    return false;
  }

  if (filter.const && filter.const !== value) {
    return false;
  }

  return true;
};
