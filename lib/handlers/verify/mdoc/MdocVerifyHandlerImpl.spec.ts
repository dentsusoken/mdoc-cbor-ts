import { mdlSchema } from '../../../schemas/mdl/mdlSchema';
import { MdocVerifyHandlerImpl } from './MdocVerifyHandlerImpl';
import { NameSpaceSchemas } from './VerifyNameSpacesSchema';

const mdoc =
  'uQADZ3ZlcnNpb25jMS4waWRvY3VtZW50c4G5AANnZG9jVHlwZXVvcmcuaXNvLjE4MDEzLjUuMS5tRExsaXNzdWVyU2lnbmVkuQACam5hbWVTcGFjZXO5AAFxb3JnLmlzby4xODAxMy41LjGC2BhYZLkABGZyYW5kb21YIL7QJ2U0bcher8UhTMU74wRAciwRkFzlfxBuxCXtMcrpaGRpZ2VzdElEAHFlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWNKQU7YGFhvuQAEZnJhbmRvbVggcgxOS8ybaSynrj59AeBZzuLheJ-XoHVUYJ_gZxgULqFoZGlnZXN0SUQBcWVsZW1lbnRJZGVudGlmaWVyb2RvY3VtZW50X251bWJlcmxlbGVtZW50VmFsdWVpMTExMTExMTE0amlzc3VlckF1dGiET6IBJgRqMTIzNDU2Nzg5MKEYIVkBgDCCAXwwggEhoAMCAQICFBJppRJQOYUY7szwXvLvoDjvxD1cMAoGCCqGSM49BAMCMBMxETAPBgNVBAMMCFZlcmlmaWVyMB4XDTI0MDgyMTAwMzgxOFoXDTI0MDkyMDAwMzgxOFowEzERMA8GA1UEAwwIVmVyaWZpZXIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQlTN99Ijfr9b-fHFjr9vI_yzBF7qRshrlsGTiSOd8qVDpP1-HH0diOwtQbX6VT89R9XduhYKxPy915ZBzyW3wxo1MwUTAdBgNVHQ4EFgQUKbwuZn0CtxSc7muz5NHdNJT0EYQwHwYDVR0jBBgwFoAUKbwuZn0CtxSc7muz5NHdNJT0EYQwDwYDVR0TAQH_BAUwAwEB_zAKBggqhkjOPQQDAgNJADBGAiEAgdwIbjgCzmlvucw4C9Zp_lPsxsPFkts6A2ckqAvKAs4CIQCqLYZXitQVn5qb9UM8uG0OfnVI_qdkV4xo_wOM3D_xNlkBudgYWQG0uQAGZ2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2bHZhbHVlRGlnZXN0c7kAAXFvcmcuaXNvLjE4MDEzLjUuMbkAAmEwWCA07yZnqI6flRJsAnt6wp2U5fHSv_lNi4isDYTcBq9-Y2ExWCDW_07BniNHGzkIb-VwlRDEUh1iO0hZr5p82HlXZpquq2x2YWxpZGl0eUluZm-5AARmc2lnbmVkwHQyMDI1LTAzLTA1VDIyOjEzOjQ2Wml2YWxpZEZyb23AdDIwMjUtMDMtMDVUMjI6MTM6NDZaanZhbGlkVW50aWzAdDIwMjYtMDMtMDVUMjI6MTM6NDZabmV4cGVjdGVkVXBkYXRlwHQyMDI2LTAzLTA1VDIyOjEzOjQ2Wm1kZXZpY2VLZXlJbmZvuQABaWRldmljZUtlebkABGExAmItMlggxMP5fFXZKlICr9mRri_Fp0uWqm1YCKbM2UCZD0C6mHJiLTNYIPAC-HbzGBlutcZSgbNoDLWtEVvCc3RXHlsNxKxpBwtTYi0xAVhAw4pyQScWRdWXVSsHm1ruNM_TINli1BtXFdtTqp0GVJQWtgHIQmwq-Fxw2bNSmrsG9YVpCZacWc5bmZO8zOqdH2xkZXZpY2VTaWduZWS5AAJqbmFtZVNwYWNlc9gYQ7kAAGpkZXZpY2VBdXRouQABb2RldmljZVNpZ25hdHVyZYRPogEmBGoxMjM0NTY3ODkwoPZYQAPPM98eif8pLnUGgWwBVOdmA5VS2Yd8ioVFbYmts9mCkMqy8kN9skQxunRHBoCas8BFw2S8_YhvKe5z4vU7UX1mc3RhdHVzAA';

const schemas: NameSpaceSchemas = {
  'org.iso.18013.5.1': mdlSchema,
};

describe('MSOVerifyHandlerImpl', () => {
  describe('constructor', () => {
    it('should create a MSOIssueHandler instance with issue method', () => {
      const mdocVerifyHandler = new MdocVerifyHandlerImpl();
      expect(mdocVerifyHandler).toBeDefined();
      expect(mdocVerifyHandler.verify).toBeDefined();
    });
  });

  describe('verify', () => {
    it('should verify a certificate', async () => {
      const mdocVerifyHandler = new MdocVerifyHandlerImpl(schemas);
      const result = await mdocVerifyHandler.verify(mdoc);
      expect(result.valid).toBe(true);
    });
  });
});
