import { decodeCbor } from '@/cbor/codec';
import {
  deviceResponseSchema,
  DEVICE_RESPONSE_AT_LEAST_ONE_MESSAGE,
} from '../DeviceResponse';
import { arrayEmptyMessage } from '@/schemas/common/Array';
import { z } from 'zod';
//import { issuerSignedSchema } from '@/schemas/mdoc/IssuerSigned';
//import { deviceSignedSchema } from '@/schemas/mdoc/DeviceSigned';
import { expect, describe, it } from 'vitest';

const base64url =
  'o2d2ZXJzaW9uYzEuMGlkb2N1bWVudHOBo2dkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiam5hbWVTcGFjZXOhcW9yZy5pc28uMTgwMTMuNS4xgtgYWIOkZnJhbmRvbVhAvzy0xTmV9BWSqTH1L5LO5KFazP-kCsBiHu3agh_dFhynMj0SLBaWYfNPrXPSK7wUIwuPquplYgA4Lb1zGEFzt2hkaWdlc3RJRBgmbGVsZW1lbnRWYWx1ZWNKQU5xZWxlbWVudElkZW50aWZpZXJqZ2l2ZW5fbmFtZdgYWI6kZnJhbmRvbVhAHgYJzrLF5peSTHD-Pl0fz4TsoOWbDA9byCgApArFdWLRNiUqAIudQIMiL4rO4apGaK-037TOvuKEUA4e4lw842hkaWdlc3RJRBhmbGVsZW1lbnRWYWx1ZWkxMTExMTExMTRxZWxlbWVudElkZW50aWZpZXJvZG9jdW1lbnRfbnVtYmVyamlzc3VlckF1dGiEQ6EBJqEYIVkChTCCAoEwggImoAMCAQICCRZK5ZkC3AUQZDAKBggqhkjOPQQDAjBYMQswCQYDVQQGEwJCRTEcMBoGA1UEChMTRXVyb3BlYW4gQ29tbWlzc2lvbjErMCkGA1UEAxMiRVUgRGlnaXRhbCBJZGVudGl0eSBXYWxsZXQgVGVzdCBDQTAeFw0yMzA1MzAxMjMwMDBaFw0yNDA1MjkxMjMwMDBaMGUxCzAJBgNVBAYTAkJFMRwwGgYDVQQKExNFdXJvcGVhbiBDb21taXNzaW9uMTgwNgYDVQQDEy9FVSBEaWdpdGFsIElkZW50aXR5IFdhbGxldCBUZXN0IERvY3VtZW50IFNpZ25lcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHyTE_TBpKpOsLPraBGkmU5Z3meZZDHC864IjrehBhy2WL2MORJsGVl6yQ35nQeNPvORO6NL2yy8aYfQJ-mvnfyjgcswgcgwHQYDVR0OBBYEFNGksSQ5MvtFcnKZSPJSfZVYp00tMB8GA1UdIwQYMBaAFDKR6w4cAR0UDnZPbE_qTJY42vsEMA4GA1UdDwEB_wQEAwIHgDASBgNVHSUECzAJBgcogYxdBQECMB8GA1UdEgQYMBaGFGh0dHA6Ly93d3cuZXVkaXcuZGV2MEEGA1UdHwQ6MDgwNqA0oDKGMGh0dHBzOi8vc3RhdGljLmV1ZGl3LmRldi9wa2kvY3JsL2lzbzE4MDEzLWRzLmNybDAKBggqhkjOPQQDAgNJADBGAiEA3l-Y5x72V1ISa_LEuE_e34HSQ8pXsVvTGKq58evrP30CIQD-Ivcya0tXWP8W_obTOo2NKYghadoEm1peLIBqsUcISFkGZNgYWQZfpmd2ZXJzaW9uYzEuMG9kaWdlc3RBbGdvcml0aG1nU0hBLTI1Nmdkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGx2YWx1ZURpZ2VzdHOhcW9yZy5pc28uMTgwMTMuNS4xuCUOWCCSQ6P7qECNZ83yj2OFKdxgUlDR8MHFEFK12da__ydkHRgmWCAcPd3X6tWiH8i3umZuftlmNJvU61odcRP686k8qBe91xhCWCD88f76Ha0w7J4Awgr8DLICqAx5KampLKH58qn5HO9HlQ9YIC1hu3zH4VXefy-6DdA1oPNNb01lhHoQpjFqmuI1CT56ClggPl574ewzPkcPg1FlgRiapiFqmrDdMgsnHi0iOibpK84FWCD_vZj4zoIkHLtt41iETpulOUSREhtDUDinbkTf8yspBRhZWCAfLDg3Sr7Zlj7sdYZvhU2oJIm5Dt0JY3k_VU25KOI-_hhmWCDHVJYBd7DE5o-7TbYpzHtPvBONzjLu-Yu2C0pg5S6gfBgZWCDyGhLW4XnA85yQYxn67AnmL91-sHj3Djl-4_pYWsadqAhYIKledSSDQcVSwbaigHLX1EzbAxdmUL1-wMKAW7jQqINoGEBYIBKoMlQBl6J7m8OVpP5ZV_ppDn9MLbbkaTR0Vc9zVTLsDVgglO_9-ooeZnWNWsH8mHitkuaBFDiUyLn0moDq7jmBoUsYMlggA1qJqF5s41TBZReiLN5pzwCud9pWOpordI5KSS0q02oYIVggon746Xd3lGa8v4L2XJOX5IsLIMtcWiGtfS5k-fgX9kMYP1gg7KZwoH624t-Xvla-QWBDdXb2eiUvXCtH5W249RSIlmkYLlgghgKr0SCrNcX_XF-kGiatcS_9RPUMkhmeluQ5gAVmNZoYSVggzyKd4p3IjnFAfvTiSCI2xPAE8eqJfgWX3mHxoKbTKwcJWCCWGTV83F87KnpYPspD1LGVhW8hm_vUp1dR7ajes6mZYRgnWCDM16gfLD0z8PuwB2qb_haTbqB9FPg38QKf3nNlQMmWaxhfWCBT6hsb4awPbJiNEUmNbhnOGm3WhbAI3qzDlwOQOdlTRRgqWCAwmk4NKtXdGiwGO51Q2HXzpGcFMm4TiYuzHL0F0nOyyhhPWCByP3DOK3D94eOETEa9dSeovPNJEcpTOZVeR2F4bJeMdBhIWCC6_pChqBhMJ9MfHCp6Ow0h10cgGvV6k-sS1_qSZMWqCBg9WCAZLL3_PxCgDIclaiFjmqTonW2ze4Q7DY1ntTNDaGGHOxhTWCB6WlSy3sY39LzcLXQqXpNX7ru-WnUqsKNDV5TD8g4RkRhQWCDuXX_WRfrCyqJ3eCowCZSnK1RoXqtu_MlryoGGjlS0WxhDWCBEVhXcBI9Wz3X8-rj0Dz4U8FYxKUZ8kQO3HpT1AYN1hxRYIJ10hWh3c07Un4KJqcJQ9rNMJKZHkSjFih3w4gJxHszQGFJYICDgPm202OgcqmQYWT19fHuvMzkjy4rf7PcN6zFo9bpXGDlYIBiAEYZLIXJOGUQKR0THBCVXq8r4hp4ZvERxNlPX6MBrGGJYIDqOjIervO-Z3Hl0YQK11tVsx177POjE0CwSz_S0hIEoEVgggkQb4J1HUI3vGnqWfCaPTL3IxfRRABl9zLSsLjycojEMWCBGjo01fB5Iimgjxzg1J1rlH3MeM7jcBdzRuSJSh_CcqRg6WCA7IG5fkd6vqz9kUb1VEJoJf8ia2dJ_NgX8w_yv2tpRVRhNWCAb1KqHYjXwCZanFhOsax-_iOHc9L_mjzMI44t1NXkxQBhWWCApsfcBmfBBTrjjwR_j41Xd0HACQBiOSTqzR7OzSUTSYxhUWCBH6xHHMPUHhTbbh0FHlmT6-LElfA4UEhZdzKwTEk33021kZXZpY2VLZXlJbmZvoWlkZXZpY2VLZXmkAQIgASFYIOERlripeKIEeezswIAh5xIPZddS6800MuG8UbCz6RScIlggRH4Wm0VK2BtO-gejXmPf2kPX1mqK159Po5BbKbRnT4hsdmFsaWRpdHlJbmZvo2ZzaWduZWTAdDIwMjQtMDYtMTdUMDk6Mzk6MDNaaXZhbGlkRnJvbcB0MjAyNC0wNi0xN1QwOTozOTowM1pqdmFsaWRVbnRpbMB0MjAyNS0wNi0xN1QwOTozOTowM1pYQN5f7-DdxKWChcp8v0Sbm8p7ikPxP8MRw05U8OrkEU-GfgN1KNSf7qiMy3MaWEEkl-VJz8bCrxCfXq1Ly0QlKhdsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WEAxalteYxOqH2qiesx2dmJolMgxWo-LoT5h6GT804VyfhEcaEacDRg3sczzP2XdR7UF1H8xk7k1SvDJUYNF5ZZaZnN0YXR1cwA';

// const base64url =
//   'uQADZ3ZlcnNpb25jMS4waWRvY3VtZW50c4G5AANnZG9jVHlwZXVvcmcuaXNvLjE4MDEzLjUuMS5tRExsaXNzdWVyU2lnbmVkuQACam5hbWVTcGFjZXO5AAFxb3JnLmlzby4xODAxMy41LjGC2BhYYqRmcmFuZG9tWCCbUvzSr3xqrhH2N_LQ_VsB0SdvmJnbCOCuhp5n8fKx8mhkaWdlc3RJRABxZWxlbWVudElkZW50aWZpZXJqZ2l2ZW5fbmFtZWxlbGVtZW50VmFsdWVjSkFO2BhYbaRmcmFuZG9tWCAk-wJj1H5TrqkkkRqXxEPymMBKbDuDJWZAQfk5LnQjPmhkaWdlc3RJRAFxZWxlbWVudElkZW50aWZpZXJvZG9jdW1lbnRfbnVtYmVybGVsZW1lbnRWYWx1ZWkxMTExMTExMTRqaXNzdWVyQXV0aIRPogEmBGoxMjM0NTY3ODkwoRghWQGAMIIBfDCCASGgAwIBAgIUEmmlElA5hRjuzPBe8u-gOO_EPVwwCgYIKoZIzj0EAwIwEzERMA8GA1UEAwwIVmVyaWZpZXIwHhcNMjQwODIxMDAzODE4WhcNMjQwOTIwMDAzODE4WjATMREwDwYDVQQDDAhWZXJpZmllcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCVM330iN-v1v58cWOv28j_LMEXupGyGuWwZOJI53ypUOk_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDGjUzBRMB0GA1UdDgQWBBQpvC5mfQK3FJzua7Pk0d00lPQRhDAfBgNVHSMEGDAWgBQpvC5mfQK3FJzua7Pk0d00lPQRhDAPBgNVHRMBAf8EBTADAQH_MAoGCCqGSM49BAMCA0kAMEYCIQCB3AhuOALOaW-5zDgL1mn-U-zGw8WS2zoDZySoC8oCzgIhAKothleK1BWfmpv1Qzy4bQ5-dUj-p2RXjGj_A4zcP_E2WQG32BhZAbKmZ3ZlcnNpb25jMS4wZ2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2bHZhbHVlRGlnZXN0c7kAAXFvcmcuaXNvLjE4MDEzLjUuMbkAAmEwWCCX7ea4fxA3t3kYZXN0c7kAAXFvcmcuaXNvLjE4MDEzLjUuMbkAAmEwWCCX7ea4fxA3t3kYS0_izkpA4TmkHOgYegFNGSR3JpZ_XWExWCAwC1GGuzdkwo2lPJChqgb8wW46vpg145o4NYOV4C1PyGx2YWxpZGl0eUluZm-5AARmc2lnbmVkwHQyMDI1LTA0LTA3VDA2OjM1OjE4Wml2YWxpZEZyb23AdDIwMjUtMDQtMDdUMDY6MzU6MThaanZhbGlkVW50aWzAdDIwMjYtMDQtMDdUMDY6MzU6MThabmV4cGVjdGVkVXBkYXRlwHQyMDI2LTA0LTA3VDA2OjM1OjE4Wm1kZXZpY2VLZXlJbmZvuQABaWRldmljZUtlebkABGExAmItMlggAMnh--BVfioKxW6qrDCgLIMcRm8uilNl53J_gyBmKERiLTNYIAxh2-JGRUaGBEs9MkLrfpbDvga_AE529wPSzSUkMFmRYi0xAVhAZ9FZKF5X1Rs_RmOXdBxjfsZB7d8rDgsrApFeerrShP1EEEcW9HN1o150z68JaYhPkiGk_kvVwD0jUVn1M-hafmxkZXZpY2VTaWduZWS5AAJqbmFtZVNwYWNlc9gYQaBqZGV2aWNlQXV0aLkAAW9kZXZpY2VTaWduYXR1cmWET6IBJgRqMTIzNDU2Nzg5MKD2WEBGlbjJHyFNSHfMPeDtLh3D5POYf3WoXQcDmYrmmDbsqFlBd5gwVaHq5KCNzPKpaP-FF0EBHaEbqAMgUPgUZ6TvZnN0YXR1cwA';
const cbor = Buffer.from(base64url, 'base64url');

describe('DeviceResponse', () => {
  describe('valid', () => {
    it('should parse a valid DeviceResponse from CBOR fixture', () => {
      const data = decodeCbor(cbor) as Map<string, unknown>;
      const result = deviceResponseSchema.parse(data);
      expect(result).toBeDefined();
    });

    it('should be valid when only documentErrors is provided (non-empty)', () => {
      const docError = new Map<string, number>([['org.iso.18013.5.1.mDL', 0]]);
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documentErrors', [docError]],
        ['status', 0],
      ]);

      const result = deviceResponseSchema.parse(input);
      expect(result).toBeDefined();
    });
  });

  describe('invalid', () => {
    it('should reject when neither documents nor documentErrors is provided', () => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['status', 0],
      ]);

      try {
        deviceResponseSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DEVICE_RESPONSE_AT_LEAST_ONE_MESSAGE
        );
      }
    });

    it('should reject when documentErrors is an empty array', () => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documentErrors', []],
        ['status', 0],
      ]);

      try {
        deviceResponseSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          arrayEmptyMessage('documentErrors')
        );
      }
    });

    it('should reject when documents is an empty array', () => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', []],
        ['status', 0],
      ]);

      try {
        deviceResponseSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(arrayEmptyMessage('documents'));
      }
    });
  });
});
