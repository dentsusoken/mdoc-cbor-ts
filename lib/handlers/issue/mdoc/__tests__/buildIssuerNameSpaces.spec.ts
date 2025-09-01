import { z } from 'zod';
import { Tag } from 'cbor-x';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { buildIssuerNameSpaces } from '../buildIssuerNameSpaces';
import type { NameSpaceElementsRecord } from '@/schemas/record/NameSpaceElementsRecord';
import { createTag24 } from '@/cbor';

/**
 * Tests for buildIssuerNameSpaces
 */

describe('buildIssuerNameSpaces', () => {
  const mockRandom = new Uint8Array(32);

  beforeEach(() => {
    vi.stubGlobal('crypto', {
      getRandomValues: vi.fn().mockReturnValue(mockRandom),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('valid cases', () => {
    it('should build IssuerNameSpaces with Tag(24) items for each element', () => {
      const input: NameSpaceElementsRecord = {
        'org.iso.18013.5.1': {
          given_name: 'John',
          family_name: 'Doe',
        },
        'org.iso.18013.5.2': {
          document_number: '1234567890',
        },
      };

      const result = buildIssuerNameSpaces(input);

      const expected = new Map<string, Tag[]>([
        [
          'org.iso.18013.5.1',
          [
            createTag24({
              digestID: 0,
              random: mockRandom,
              elementIdentifier: 'given_name',
              elementValue: 'John',
            }),
            createTag24({
              digestID: 1,
              random: mockRandom,
              elementIdentifier: 'family_name',
              elementValue: 'Doe',
            }),
          ],
        ],
        [
          'org.iso.18013.5.2',
          [
            createTag24({
              digestID: 2,
              random: mockRandom,
              elementIdentifier: 'document_number',
              elementValue: '1234567890',
            }),
          ],
        ],
      ]);
      expect(result).toEqual(expected);
    });
  });

  describe('invalid cases', () => {
    it('should throw when an inner namespace has no elements', () => {
      const input = {
        'org.iso.18013.5.1': {},
      } as unknown as NameSpaceElementsRecord;

      try {
        buildIssuerNameSpaces(input);
        expect.fail('Expected ZodError for empty inner record');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            recordEmptyMessage('NameSpaceElementsRecord.Value')
          );
        }
      }
    });

    it('should throw when there are no namespaces', () => {
      const input = {} as NameSpaceElementsRecord;
      try {
        buildIssuerNameSpaces(input);
        expect.fail('Expected ZodError for empty outer record');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            recordEmptyMessage('NameSpaceElementsRecord')
          );
        }
      }
    });

    it('should throw for invalid input type', () => {
      try {
        buildIssuerNameSpaces(
          'not-a-record' as unknown as NameSpaceElementsRecord
        );
        expect.fail('Expected parse to throw a ZodError');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            recordInvalidTypeMessage('NameSpaceElementsRecord')
          );
        }
      }
    });
  });
});
