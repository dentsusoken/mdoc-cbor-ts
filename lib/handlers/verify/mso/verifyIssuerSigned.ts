import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Sign1Tuple } from '@/cose/Sign1';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { MobileSecurityObject } from '@/schemas/mso/MobileSecurityObject';
import { verifyValueDigests } from './verifyValueDigests';
import { verifyValidityInfo } from './verifyValidityInfo';
import { verifyIssuerAuthTuple } from './verifyIssuerAuthTuple';
import { verifyMobileSecurityObject } from './verifyMobileSecurityObject';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { toIssuerSignedObject } from '@/handlers/to-object';

/**
 * Parameters for verifying an IssuerSigned structure.
 */
interface VerifyIssuerSignedParams {
  /** The IssuerSigned structure to verify */
  issuerSigned: IssuerSigned;
  /** The current date and time */
  now: Date;
  /** Acceptable clock skew in seconds */
  clockSkew?: number;
}

/**
 * The result of verifying an IssuerSigned structure.
 */
interface VerifyIssuerSignedResult {
  /** The validated Mobile Security Object (MSO) */
  mso: MobileSecurityObject;
  /** The issuer namespaces associated with the document */
  nameSpaces: IssuerNameSpaces;
}

/**
 * Verifies the IssuerSigned structure of a Mobile Document (mDL).
 *
 * @description
 * This function performs comprehensive verification of the IssuerSigned container,
 * including:
 *   1. Verifies the presence of required fields (nameSpaces, issuerAuth).
 *   2. Verifies the IssuerAuth using {@link verifyIssuerAuthTuple}, returning the MSO payload.
 *   3. Decodes and validates the Mobile Security Object with {@link verifyMobileSecurityObject}.
 *   4. Verifies the value digests using {@link verifyValueDigests}.
 *   5. Validates the validityInfo within the MSO via {@link verifyValidityInfo}.
 *
 * Throws detailed {@link ErrorCodeError}s with appropriate {@link MdocErrorCode}
 * if any step fails.
 *
 * @param params - The parameters for verification.
 * @param params.issuerSigned - The IssuerSigned structure to verify.
 * @param params.now - The current time for evaluating validity dates.
 * @param params.clockSkew - The acceptable clock skew in seconds.
 *
 * @returns An object containing the validated MSO and its namespaces.
 *
 * @throws {ErrorCodeError} If required fields are missing or any sub-verification step fails.
 */
export const verifyIssuerSigned = ({
  issuerSigned,
  now,
  clockSkew,
}: VerifyIssuerSignedParams): VerifyIssuerSignedResult => {
  const { nameSpaces, issuerAuth } = toIssuerSignedObject(issuerSigned);

  const payload = verifyIssuerAuthTuple(
    issuerAuth.value as Sign1Tuple,
    now,
    clockSkew
  );

  const mso = verifyMobileSecurityObject(payload);

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

  return { mso, nameSpaces };
};
