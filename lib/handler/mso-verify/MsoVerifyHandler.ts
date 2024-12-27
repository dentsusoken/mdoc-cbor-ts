import { RawIssuerSigned } from '../../schemas/issuerSignedSchema';

export interface MsoVerifySuccess {
  verified: true;
}

export interface MsoVerifyFailure {
  verified: false;
  error: Error;
}

export type MsoVerifyResult = MsoVerifySuccess | MsoVerifyFailure;

export interface MsoVerifyHandler {
  verify(issuerSigned: RawIssuerSigned): Promise<MsoVerifyResult>;
}
