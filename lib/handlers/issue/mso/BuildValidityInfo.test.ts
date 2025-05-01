import { describe, expect, it, vi } from 'vitest';
import { DateTime } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { createValidityInfoBuilder } from './BuildValidityInfo';

describe('createValidityInfoBuilder', () => {
  const mockNow = 1000000000000; // 2001-09-09T01:46:40.000Z

  beforeEach(() => {
    vi.spyOn(DateTime, 'now').mockReturnValue(mockNow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create validity info without expected update', () => {
    const configuration = new Configuration({
      validFrom: 0,
      validUntil: 86400000, // 1 day in milliseconds
      digestAlgorithm: 'SHA-256',
    });

    const builder = createValidityInfoBuilder({ configuration });
    const validityInfo = builder();

    expect(validityInfo).toEqual({
      signed: new DateTime(mockNow),
      validFrom: new DateTime(mockNow),
      validUntil: new DateTime(mockNow + 86400000),
    });
  });

  it('should create validity info with expected update', () => {
    const configuration = new Configuration({
      validFrom: 0,
      validUntil: 86400000, // 1 day in milliseconds
      expectedUpdate: 43200000, // 12 hours in milliseconds
      digestAlgorithm: 'SHA-256',
    });

    const builder = createValidityInfoBuilder({ configuration });
    const validityInfo = builder();

    expect(validityInfo).toEqual({
      signed: new DateTime(mockNow),
      validFrom: new DateTime(mockNow),
      validUntil: new DateTime(mockNow + 86400000),
      expectedUpdate: new DateTime(mockNow + 43200000),
    });
  });

  it('should handle negative validity periods', () => {
    const configuration = new Configuration({
      validFrom: -3600000, // -1 hour in milliseconds
      validUntil: 86400000, // 1 day in milliseconds
      digestAlgorithm: 'SHA-256',
    });

    const builder = createValidityInfoBuilder({ configuration });
    const validityInfo = builder();

    expect(validityInfo).toEqual({
      signed: new DateTime(mockNow),
      validFrom: new DateTime(mockNow - 3600000),
      validUntil: new DateTime(mockNow + 86400000),
    });
  });
});
