import { z } from 'zod';
import { decode } from 'cbor-x';
import { bufferSchema } from './bufferSchema';

export const base64Schema = z
  .string()
  .base64()
  .transform((data) => {
    return Buffer.from(data, 'base64');
  });
export const base64UrlSchema = z
  .string()
  .base64url()
  .transform((data) => {
    return Buffer.from(data, 'base64url');
  });
export const hexSchema = z
  .string()
  .regex(/^[0-9a-fA-F]+$/)
  .transform((data) => {
    return Buffer.from(data, 'hex');
  });

export const cborStringSchema = z.union([
  hexSchema,
  base64Schema,
  base64UrlSchema,
]);

export const cborSchema = z
  .union([cborStringSchema, bufferSchema])
  .transform((data) => {
    return decode(data);
  });
