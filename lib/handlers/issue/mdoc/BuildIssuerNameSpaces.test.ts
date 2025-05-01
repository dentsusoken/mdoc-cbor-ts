import crypto from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { ByteString } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { createIssuerNameSpacesBuilder } from './BuildIssuerNameSpaces';

describe('createIssuerNameSpacesBuilder', () => {
  const mockRandom = crypto.getRandomValues(new Uint8Array(32));

  beforeEach(() => {
    // @ts-ignore
    global.crypto = {
      getRandomValues: vi.fn().mockReturnValue(mockRandom),
    };
  });

  afterEach(() => {
    // @ts-ignore
    global.crypto = crypto;
  });

  it('should create issuer name spaces', () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
      tagElements: {
        'test-element': 24,
      },
    });

    const data = {
      'org.iso.18013.5.1': {
        'test-element': 123,
      },
    };

    const builder = createIssuerNameSpacesBuilder({ configuration });
    const issuerNameSpaces = builder(data);

    console.log('issuerNameSpaces :>> ', issuerNameSpaces);

    expect(issuerNameSpaces).toEqual({
      'org.iso.18013.5.1': [
        new ByteString({
          data: {
            random: mockRandom,
            digestID: 0,
            elementIdentifier: 'test-element',
            elementValue: 123,
          },
        }),
      ],
    });
  });

  it('should handle multiple elements in a namespace', () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
      tagElements: {
        'test-element-1': 24,
        'test-element-2': 25,
      },
    });

    const data = {
      'org.iso.18013.5.1': {
        'test-element-1': 123,
        'test-element-2': 456,
      },
    };

    const builder = createIssuerNameSpacesBuilder({ configuration });
    const issuerNameSpaces = builder(data);

    expect(issuerNameSpaces).toEqual({
      'org.iso.18013.5.1': [
        new ByteString({
          random: mockRandom,
          digestID: 0,
          elementIdentifier: 'test-element-1',
          elementValue: 123,
        }),
        new ByteString({
          random: mockRandom,
          digestID: 1,
          elementIdentifier: 'test-element-2',
          elementValue: 456,
        }),
      ],
    });
  });

  it('should handle multiple namespaces', () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
      tagElements: {
        'test-element-1': 24,
        'test-element-2': 25,
      },
    });

    const data = {
      'org.iso.18013.5.1': {
        'test-element-1': 123,
      },
      'org.iso.18013.5.2': {
        'test-element-2': 456,
      },
    };

    const builder = createIssuerNameSpacesBuilder({ configuration });
    const issuerNameSpaces = builder(data);

    expect(issuerNameSpaces).toEqual({
      'org.iso.18013.5.1': [
        new ByteString({
          random: mockRandom,
          digestID: 0,
          elementIdentifier: 'test-element-1',
          elementValue: 123,
        }),
      ],
      'org.iso.18013.5.2': [
        new ByteString({
          random: mockRandom,
          digestID: 1,
          elementIdentifier: 'test-element-2',
          elementValue: 456,
        }),
      ],
    });
  });

  it('should handle elements without tags', () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
      tagElements: {},
    });

    const data = {
      'org.iso.18013.5.1': {
        'test-element': 'test-value',
      },
    };

    const builder = createIssuerNameSpacesBuilder({ configuration });
    const issuerNameSpaces = builder(data);

    expect(issuerNameSpaces).toEqual({
      'org.iso.18013.5.1': [
        new ByteString({
          random: mockRandom,
          digestID: 0,
          elementIdentifier: 'test-element',
          elementValue: 'test-value',
        }),
      ],
    });
  });

  it('should throw error when namespace is empty', () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
      tagElements: {},
    });

    const data = {
      'org.iso.18013.5.1': {},
    };

    const builder = createIssuerNameSpacesBuilder({ configuration });
    expect(() => builder(data)).toThrow(
      'No issuer signed items for namespace org.iso.18013.5.1'
    );
  });
});
