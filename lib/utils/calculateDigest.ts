import crypto from 'crypto';
import { ByteString, encode } from '../cbor';
import { DigestAlgorithm } from '../schemas/mso';

export const calculateDigest = async (
  algorithm: DigestAlgorithm,
  data: ByteString
): Promise<Buffer> => {
  return Buffer.from(await crypto.subtle.digest(algorithm, encode(data)));
};
