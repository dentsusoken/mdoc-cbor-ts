import { ValidityInfo } from '@/schemas/mso/ValidityInfo';

interface VerifyValidityInfoParams {
  validityInfo: ValidityInfo;
  now?: Date;
  clockSkew?: number;
}

export const verifyValidityInfo = ({
  validityInfo,
  now = new Date(),
  clockSkew = 60,
}: VerifyValidityInfoParams): void => {
  const validFrom = new Date(validityInfo.get('validFrom')!.value);
  const validUntil = new Date(validityInfo.get('validUntil')!.value);

  const result = validityInfoSchema.safeParse(validityInfo);

  if (!result.success) {
    throw new Error('Invalid ValidityInfo');
  }
};
