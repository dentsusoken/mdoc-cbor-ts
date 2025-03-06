import { decode } from '../../../cbor';
import { deviceResponseSchema } from '../../../schemas/mdoc';
import { MSOVerifyHandlerImpl } from './MSOVerifyHandlerImpl';

const base64url =
  'uQADZ3ZlcnNpb25jMS4waWRvY3VtZW50c4G5AANnZG9jVHlwZXVvcmcuaXNvLjE4MDEzLjUuMS5tRExsaXNzdWVyU2lnbmVkuQACam5hbWVTcGFjZXO5AAFxb3JnLmlzby4xODAxMy41LjGC2BhYb7kABGZyYW5kb21YIKfZxIVJP0rUr1uRp3i0qSBjzZ9Vl_o1YKAZpgL5Hp9yaGRpZ2VzdElEAHFlbGVtZW50SWRlbnRpZmllcmkxMTExMTExMTRsZWxlbWVudFZhbHVlb2RvY3VtZW50X251bWJlctgYWGS5AARmcmFuZG9tWCCAAcDvtVQnbR5wIcCu8Hp7V17lZj1aJRQEe3_n5480HGhkaWdlc3RJRAFxZWxlbWVudElkZW50aWZpZXJjSkFObGVsZW1lbnRWYWx1ZWpnaXZlbl9uYW1lamlzc3VlckF1dGiET6IBJgRqMTIzNDU2Nzg5MKEYIVkBgDCCAXwwggEhoAMCAQICFBJppRJQOYUY7szwXvLvoDjvxD1cMAoGCCqGSM49BAMCMBMxETAPBgNVBAMMCFZlcmlmaWVyMB4XDTI0MDgyMTAwMzgxOFoXDTI0MDkyMDAwMzgxOFowEzERMA8GA1UEAwwIVmVyaWZpZXIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQlTN99Ijfr9b-fHFjr9vI_yzBF7qRshrlsGTiSOd8qVDpP1-HH0diOwtQbX6VT89R9XduhYKxPy915ZBzyW3wxo1MwUTAdBgNVHQ4EFgQUKbwuZn0CtxSc7muz5NHdNJT0EYQwHwYDVR0jBBgwFoAUKbwuZn0CtxSc7muz5NHdNJT0EYQwDwYDVR0TAQH_BAUwAwEB_zAKBggqhkjOPQQDAgNJADBGAiEAgdwIbjgCzmlvucw4C9Zp_lPsxsPFkts6A2ckqAvKAs4CIQCqLYZXitQVn5qb9UM8uG0OfnVI_qdkV4xo_wOM3D_xNlkBudgYWQG0uQAGZ2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2bHZhbHVlRGlnZXN0c7kAAXFvcmcuaXNvLjE4MDEzLjUuMbkAAmEwWCCXIrX7gYOu7LswXOW3rR8oJXyyzH_U9FkPswRXdWcgX2ExWCAi90wDgzGcchPJyuRPWzPVraTHL82YSKM_6rbasHSWV2x2YWxpZGl0eUluZm-5AARmc2lnbmVkwHQyMDI1LTAzLTA1VDIwOjU2OjE4Wml2YWxpZEZyb23AdDIwMjUtMDMtMDVUMjA6NTY6MThaanZhbGlkVW50aWzAdDIwMjYtMDMtMDVUMjA6NTY6MThabmV4cGVjdGVkVXBkYXRlwHQyMDI2LTAzLTA1VDIwOjU2OjE4Wm1kZXZpY2VLZXlJbmZvuQABaWRldmljZUtlebkABGExAmItMlggei8-DzCqWxV0r4CSFmSdXUeNlwQmGHZZZGucudxvG2ViLTNYICNKuLbljhhHRGcsXsX9yMWFWa8m0qJkM3LXZtHAkNHsYi0xAVhA-3GRHLDtE2whhBEkxmbJop-ArRw0hoKvF4wF-Q5CXyifAxX6ShE_0ru-MRWpCNXjCOTvYR9d9hthN12Qg_bIy2xkZXZpY2VTaWduZWS5AAJqbmFtZVNwYWNlc9gYQ7kAAGpkZXZpY2VBdXRouQABb2RldmljZVNpZ25hdHVyZYRPogEmBGoxMjM0NTY3ODkwoPZYQJs8ik7mluonnssG2rBNFpEmaLtsCzMvJmMDhbFeRdp7c4BkgWHbCfHat7zdwU_KnZ0u3yp0zSv43U4oeGpSK8Vmc3RhdHVzAA';
const cbor = Buffer.from(base64url, 'base64url');
const mdoc = deviceResponseSchema.parse(decode(cbor));

describe('MSOVerifyHandlerImpl', () => {
  describe('constructor', () => {
    it('should create a MSOIssueHandler instance with issue method', () => {
      const msoVerifyHandler = new MSOVerifyHandlerImpl();
      expect(msoVerifyHandler).toBeDefined();
      expect(msoVerifyHandler.verify).toBeDefined();
    });
  });

  describe('verify', () => {
    it('should verify a certificate', async () => {
      const msoVerifyHandler = new MSOVerifyHandlerImpl();
      const { issuerAuth, nameSpaces } = mdoc.documents![0].issuerSigned;
      expect(
        async () => await msoVerifyHandler.verify(issuerAuth, nameSpaces)
      ).not.toThrow();
    });
  });
});
