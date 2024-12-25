import { describe, it, expect } from 'vitest';
import { createDefaultNameSpacesGenerator } from './NameSpacesGenerator';
import { TypedTag } from '../../cbor';

describe('NameSpacesGenerator', () => {
  const nameSpacesGenerator = createDefaultNameSpacesGenerator({
    SALT_LENGTH: 32,
  });

  it('should generate nameSpaces from input data', async () => {
    const inputData = {
      org: {
        name: 'Test Org',
      },
    };

    const result = await nameSpacesGenerator(inputData);

    expect(result).toHaveProperty('raw');
    expect(result.raw.org).toBeInstanceOf(Array);
    result.raw.org.forEach((item) => {
      expect(item).toBeInstanceOf(TypedTag);
    });
  });

  it('should handle empty input data', async () => {
    const result = await nameSpacesGenerator({});
    expect(result).toEqual({
      raw: {},
      encoded: {},
    });
  });
});
