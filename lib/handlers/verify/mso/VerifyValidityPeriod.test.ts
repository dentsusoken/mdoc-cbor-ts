import { verifyValidityPeriod } from './VerifyValidityPeriod';
import { DateTime } from '../../../cbor';

describe('verifyValidityPeriod', () => {
  it('should not throw if current time is within the validity period', async () => {
    const now = Date.now();
    await expect(
      verifyValidityPeriod(new DateTime(now - 1000), new DateTime(now + 1000))
    ).resolves.not.toThrow();
  });

  it('should throw if validFrom is in the future', async () => {
    const now = Date.now();
    await expect(
      verifyValidityPeriod(new DateTime(now + 1000), new DateTime(now + 2000))
    ).rejects.toThrow('Validity period is not valid');
  });

  it('should throw if validUntil is in the past', async () => {
    const now = Date.now();
    await expect(
      verifyValidityPeriod(new DateTime(now - 2000), new DateTime(now - 1000))
    ).rejects.toThrow('Validity period is not valid');
  });

  it('should not throw if validFrom and validUntil are the same (no expiration)', async () => {
    const now = Date.now();
    await expect(
      verifyValidityPeriod(new DateTime(now), new DateTime(now))
    ).resolves.not.toThrow();
  });
});
