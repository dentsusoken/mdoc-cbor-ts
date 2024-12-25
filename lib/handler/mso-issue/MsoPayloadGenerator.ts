import { DateTime } from 'luxon';
import { HashMap, MsoPayload } from '../../schemas';
import { encodeMsoDate } from '../../utils/dataUtils';

export type MsoPayloadGenerator = (
  hashMap: HashMap,
  expirationDeltaHours?: number,
  validFrom?: Date
) => Promise<MsoPayload>;

export const defaultMsoPayloadGenerator: MsoPayloadGenerator = async (
  hashMap: HashMap,
  expirationDeltaHours?: number,
  validFrom?: Date
) => {
  const now = DateTime.now();
  const validUntil = expirationDeltaHours
    ? now.plus({
        hours: expirationDeltaHours,
      })
    : now.plus({
        year: 5,
      });

  return {
    version: '1.0',
    digestAlgorithm: 'SHA-256',
    valueDigests: hashMap,
    docType: 'Mso',
    validityInfo: {
      signed: encodeMsoDate(new Date()),
      validFrom: validFrom
        ? encodeMsoDate(validFrom)
        : encodeMsoDate(new Date()),
      validUntil: validUntil
        ? encodeMsoDate(validUntil.toJSDate())
        : encodeMsoDate(new Date()),
    },
  };
};
