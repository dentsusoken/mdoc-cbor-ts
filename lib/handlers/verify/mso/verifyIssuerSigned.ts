import { decodeCbor } from '@/cbor/codec';
import { Sign1 } from '@/cose/Sign1';
import { JwkPublicKey } from '@/jwk/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MDocErrorCode } from '@/mdoc/types';
import { Sing1Tuple } from '@/schemas/cose/Sign1';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import {
  MobileSecurityObject,
  mobileSecurityObjectSchema,
} from '@/schemas/mso/MobileSecurityObject';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { verifyValueDigests } from './verifyValueDigests';
import { verifyValidityInfo } from './verifyValidityInfo';
import { verifyIssuerAuthTuple } from './verifyIssuerAuthTuple';

interface VerifyIssuerSignedParams {
  issuerSigned: IssuerSigned;
  now?: Date;
  /** Acceptable clock skew in seconds */
  clockSkew?: number;
}

export const verifyIssuerSigned = ({
  issuerSigned,
  now = new Date(),
  clockSkew = 60,
}: VerifyIssuerSignedParams): void => {
  const nameSpaces = issuerSigned.get('nameSpaces');
  if (!nameSpaces) {
    throw new ErrorCodeError(
      'NameSpaces are missing',
      MDocErrorCode.NameSpacesMissing
    );
  }

  const issuerAuth = issuerSigned.get('issuerAuth');
  if (!issuerAuth) {
    throw new ErrorCodeError(
      'IssuerAuth is missing',
      MDocErrorCode.IssuerAuthMissing
    );
  }

  const payload = verifyIssuerAuthTuple(
    issuerAuth.value as Sing1Tuple,
    now,
    clockSkew
  );

  let decodedPayload: unknown | undefined = undefined;
  try {
    decodedPayload = decodeCbor(payload);
  } catch (error) {
    throw new ErrorCodeError(
      `Failed to decode the IssuerAuth payload: ${getErrorMessage(error)}`,
      MDocErrorCode.IssuerAuthPayloadDecodingFailed
    );
  }

  const msoResult = mobileSecurityObjectSchema.safeParse(decodedPayload);
  if (!msoResult.success) {
    throw new ErrorCodeError(
      `MobileSecurityObject is invalid: ${msoResult.error.message}`,
      MDocErrorCode.MobileSecurityObjectInvalid
    );
  }
  const mso = msoResult.data as MobileSecurityObject;

  verifyValueDigests({
    valueDigests: mso.get('valueDigests')!,
    nameSpaces,
    digestAlgorithm: mso.get('digestAlgorithm')!,
  });

  verifyValidityInfo({
    validityInfo: mso.get('validityInfo')!,
    now,
    clockSkew,
  });
};
