import { describe, expect, it } from 'vitest';
import { createNameSpacesToJSONHandler } from './NameSpacesToJSONHandler';
import { z } from 'zod';
import { TypedTag } from '../../cbor';
import { Buffer } from 'buffer';

describe('NameSpacesToJSONHandler', () => {
  const mockDisclosureItems = [
    new TypedTag(
      {
        random: Buffer.from([1, 2, 3]),
        digestID: 1,
        elementIdentifier: 'given_name',
        elementValue: 'John',
      },
      24
    ),
    new TypedTag(
      {
        random: Buffer.from([4, 5, 6]),
        digestID: 2,
        elementIdentifier: 'family_name',
        elementValue: 'Doe',
      },
      24
    ),
  ];

  const mockNameSpaces = {
    'org.iso.18013.5.1': mockDisclosureItems,
  };

  it('should transform nameSpaces to JSON with default schema', async () => {
    const defaultSchema = z.array(
      z.object({
        'org.iso.18013.5.1': z.array(z.record(z.string(), z.unknown())),
      })
    );
    const handler = createNameSpacesToJSONHandler(defaultSchema);

    const result = await handler(mockNameSpaces);

    expect(result).toEqual([
      {
        'org.iso.18013.5.1': [{ given_name: 'John' }, { family_name: 'Doe' }],
      },
    ]);
  });

  it('should transform nameSpaces to JSON with custom schema', async () => {
    const customSchema = z.array(
      z.object({
        'org.iso.18013.5.1': z.array(
          z.object({
            given_name: z.string().optional(),
            family_name: z.string().optional(),
          })
        ),
      })
    );
    const handler = createNameSpacesToJSONHandler(customSchema);

    const result = await handler(mockNameSpaces);

    expect(result).toEqual([
      {
        'org.iso.18013.5.1': [{ given_name: 'John' }, { family_name: 'Doe' }],
      },
    ]);
  });

  it('should handle empty nameSpaces', async () => {
    const defaultSchema = z.array(z.record(z.string(), z.unknown()));
    const handler = createNameSpacesToJSONHandler(defaultSchema);

    const result = await handler({});

    expect(result).toEqual([]);
  });

  it('should handle nameSpaces with empty arrays', async () => {
    const defaultSchema = z.array(z.record(z.string(), z.unknown()));
    const handler = createNameSpacesToJSONHandler(defaultSchema);

    const result = await handler({
      'org.iso.18013.5.1': [],
    });

    expect(result).toEqual([
      {
        'org.iso.18013.5.1': [],
      },
    ]);
  });

  it('should throw error when schema validation fails', async () => {
    const strictSchema = z.array(
      z.object({
        'org.iso.18013.5.1': z.array(
          z.object({
            given_name: z.string(),
            family_name: z.string(),
            age: z.number(), // required field that doesn't exist
          })
        ),
      })
    );
    const handler = createNameSpacesToJSONHandler(strictSchema);

    await expect(handler(mockNameSpaces)).rejects.toThrow();
  });
});
