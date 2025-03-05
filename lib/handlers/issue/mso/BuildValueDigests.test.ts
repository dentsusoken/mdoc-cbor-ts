import crypto from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { ByteString } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { createValueDigestsBuilder } from './BuildValueDigests';

describe('createValueDigestsBuilder', () => {
  const mockDigest = Buffer.from('test-digest');

  beforeEach(() => {
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(mockDigest);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create value digests for name spaces', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const nameSpaces = {
      'org.iso.18013.5.1': [
        new ByteString({
          digestID: 1,
          random: Buffer.from('test-random'),
          elementIdentifier: 'test-element',
          elementValue: 'test-value',
        }),
      ] as [
        ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>,
        ...ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>[],
      ],
    };

    const builder = createValueDigestsBuilder({ configuration });
    const valueDigests = await builder(nameSpaces, 'SHA-256');

    expect(valueDigests).toEqual({
      'org.iso.18013.5.1': {
        1: mockDigest,
      },
    });
  });

  it('should handle multiple elements in a namespace', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const nameSpaces = {
      'org.iso.18013.5.1': [
        new ByteString({
          digestID: 1,
          random: Buffer.from('test-random-1'),
          elementIdentifier: 'test-element-1',
          elementValue: 'test-value-1',
        }),
        new ByteString({
          digestID: 2,
          random: Buffer.from('test-random-2'),
          elementIdentifier: 'test-element-2',
          elementValue: 'test-value-2',
        }),
      ] as [
        ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>,
        ...ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>[],
      ],
    };

    const builder = createValueDigestsBuilder({ configuration });
    const valueDigests = await builder(nameSpaces, 'SHA-256');

    expect(valueDigests).toEqual({
      'org.iso.18013.5.1': {
        1: mockDigest,
        2: mockDigest,
      },
    });
  });

  it('should handle multiple namespaces', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const nameSpaces = {
      'org.iso.18013.5.1': [
        new ByteString({
          digestID: 1,
          random: Buffer.from('test-random-1'),
          elementIdentifier: 'test-element-1',
          elementValue: 'test-value-1',
        }),
      ] as [
        ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>,
        ...ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>[],
      ],
      'org.iso.18013.5.2': [
        new ByteString({
          digestID: 1,
          random: Buffer.from('test-random-2'),
          elementIdentifier: 'test-element-2',
          elementValue: 'test-value-2',
        }),
      ] as [
        ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>,
        ...ByteString<{
          digestID: number;
          random: Buffer;
          elementIdentifier: string;
          elementValue?: any;
        }>[],
      ],
    };

    const builder = createValueDigestsBuilder({ configuration });
    const valueDigests = await builder(nameSpaces, 'SHA-256');

    expect(valueDigests).toEqual({
      'org.iso.18013.5.1': {
        1: mockDigest,
      },
      'org.iso.18013.5.2': {
        1: mockDigest,
      },
    });
  });

  it('should throw error when name spaces are empty', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const nameSpaces = {};

    const builder = createValueDigestsBuilder({ configuration });
    await expect(builder(nameSpaces, 'SHA-256')).rejects.toThrow(
      'NameSpaces are required'
    );
  });

  it('should throw error when name spaces are invalid', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const nameSpaces = {};

    const builder = createValueDigestsBuilder({ configuration });
    await expect(builder(nameSpaces, 'SHA-256')).rejects.toThrow(
      'NameSpaces are required'
    );
  });
});
