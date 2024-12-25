import { describe, expect, it, vi } from 'vitest';
import { defaultMsoPayloadGenerator } from './MsoPayloadGenerator';
import { HashMap } from '../../schemas';
import { DateTime } from 'luxon';
import { encodeMsoDate } from '../../utils/dataUtils';

describe('MsoPayloadGenerator', () => {
  const mockHashMap: HashMap = {
    'org.iso.18013.5.1': {
      1: new Uint8Array([1, 2, 3, 4]),
      2: new Uint8Array([5, 6, 7, 8]),
    },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate payload with default expiration', async () => {
    const result = await defaultMsoPayloadGenerator(mockHashMap);

    expect(result).toEqual({
      version: '1.0',
      digestAlgorithm: 'SHA-256',
      valueDigests: mockHashMap,
      docType: 'Mso',
      validityInfo: {
        signed: encodeMsoDate(new Date('2024-01-01T00:00:00Z')),
        validFrom: encodeMsoDate(new Date('2024-01-01T00:00:00Z')),
        validUntil: encodeMsoDate(
          DateTime.fromJSDate(new Date('2024-01-01T00:00:00Z'))
            .plus({ year: 5 })
            .toJSDate()
        ),
      },
    });
  });

  it('should generate payload with custom expiration', async () => {
    const expirationDeltaHours = 24;
    const result = await defaultMsoPayloadGenerator(
      mockHashMap,
      expirationDeltaHours
    );

    expect(result).toEqual({
      version: '1.0',
      digestAlgorithm: 'SHA-256',
      valueDigests: mockHashMap,
      docType: 'Mso',
      validityInfo: {
        signed: encodeMsoDate(new Date('2024-01-01T00:00:00Z')),
        validFrom: encodeMsoDate(new Date('2024-01-01T00:00:00Z')),
        validUntil: encodeMsoDate(
          DateTime.fromJSDate(new Date('2024-01-01T00:00:00Z'))
            .plus({ hours: expirationDeltaHours })
            .toJSDate()
        ),
      },
    });
  });

  it('should generate payload with custom validFrom', async () => {
    const validFrom = new Date('2024-01-02T00:00:00Z');
    const result = await defaultMsoPayloadGenerator(
      mockHashMap,
      undefined,
      validFrom
    );

    expect(result).toEqual({
      version: '1.0',
      digestAlgorithm: 'SHA-256',
      valueDigests: mockHashMap,
      docType: 'Mso',
      validityInfo: {
        signed: encodeMsoDate(new Date('2024-01-01T00:00:00Z')),
        validFrom: encodeMsoDate(validFrom),
        validUntil: encodeMsoDate(
          DateTime.fromJSDate(new Date('2024-01-01T00:00:00Z'))
            .plus({ year: 5 })
            .toJSDate()
        ),
      },
    });
  });

  it('should generate payload with both custom expiration and validFrom', async () => {
    const expirationDeltaHours = 24;
    const validFrom = new Date('2024-01-02T00:00:00Z');
    const result = await defaultMsoPayloadGenerator(
      mockHashMap,
      expirationDeltaHours,
      validFrom
    );

    expect(result).toEqual({
      version: '1.0',
      digestAlgorithm: 'SHA-256',
      valueDigests: mockHashMap,
      docType: 'Mso',
      validityInfo: {
        signed: encodeMsoDate(new Date('2024-01-01T00:00:00Z')),
        validFrom: encodeMsoDate(validFrom),
        validUntil: encodeMsoDate(
          DateTime.fromJSDate(new Date('2024-01-01T00:00:00Z'))
            .plus({ hours: expirationDeltaHours })
            .toJSDate()
        ),
      },
    });
  });

  it('should handle undefined validUntil', async () => {
    const validFrom = new Date('2024-01-02T00:00:00Z');
    const result = await defaultMsoPayloadGenerator(
      mockHashMap,
      undefined,
      validFrom
    );

    expect(result.validityInfo.validUntil).toBeDefined();
  });
});
