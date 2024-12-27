import { z } from 'zod';
import { cborSchema } from '../../schemas/common/cborSchema';
import { rawMdocSchema } from '../../schemas/mdocSchema';
import { MsoVerifyHandler } from '../mso-verify/MsoVerifyHandler';
import { MdocVerifyHandler, MdocVerifyResult } from './MdocVerifyHandler';
import {
  createNameSpacesToJSONHandler,
  NameSpacesToJSONHandler,
} from './NameSpacesToJSONHandler';

type DefaultSchema = Record<string, Record<string, any>[]>[];

const defaultSchema = z
  .array(z.record(z.string(), z.array(z.record(z.string(), z.any()))))
  .nonempty() as z.ZodType<DefaultSchema>;

export class MdocVerifyHandlerImpl<T = z.infer<typeof defaultSchema>>
  implements MdocVerifyHandler<T>
{
  #msoVerifyHandler: MsoVerifyHandler;
  // #errors: Error[] = [];
  #nameSpacesToJSONHandler: NameSpacesToJSONHandler<T>;

  constructor(
    msoVerifyHandler: MsoVerifyHandler,
    schema: z.ZodSchema<T> = defaultSchema as z.ZodSchema<T>
  ) {
    this.#msoVerifyHandler = msoVerifyHandler;
    this.#nameSpacesToJSONHandler = createNameSpacesToJSONHandler(schema);
  }

  async verify(cbor: string | Buffer): Promise<MdocVerifyResult<T>> {
    const errors: Error[] = []; // Reset errors at the start

    try {
      const mdoc = rawMdocSchema.parse(cborSchema.parse(cbor));

      // Verify all documents sequentially
      for (const document of mdoc.documents) {
        const msoVerifyResult = await this.#msoVerifyHandler.verify(
          document.issuerSigned
        );
        if (!msoVerifyResult.verified) {
          errors.push(msoVerifyResult.error);
          return { verified: false, errors };
        }
      }

      // If all documents are verified, transform the data
      try {
        const data = await this.#nameSpacesToJSONHandler(
          mdoc.documents[0].issuerSigned.nameSpaces
        );
        return { verified: true, data };
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
        } else {
          errors.push(new Error('Data transformation failed'));
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error);
      } else {
        errors.push(new Error('Invalid CBOR data'));
      }
    }

    return { verified: false, errors };
  }
}
