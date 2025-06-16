import { mdlSchema } from '../../../schemas/mdl/mdlSchema';
import { MdocVerifyHandlerImpl } from './MdocVerifyHandlerImpl';
import { NameSpaceSchemas } from './VerifyNameSpacesSchema';

const mdoc =
  'uQADZ3ZlcnNpb25jMS4waWRvY3VtZW50c4G5AANnZG9jVHlwZXVvcmcuaXNvLjE4MDEzLjUuMS5tRExsaXNzdWVyU2lnbmVkuQACam5hbWVTcGFjZXO5AAFxb3JnLmlzby4xODAxMy41LjGC2BhYYqRmcmFuZG9tWCDY7LAJhUQxaT-R1_U220E-IxhyWCWXNcoEHCOKzAdw_GhkaWdlc3RJRABxZWxlbWVudElkZW50aWZpZXJqZ2l2ZW5fbmFtZWxlbGVtZW50VmFsdWVjSkFO2BhYbaRmcmFuZG9tWCBFcZ_1nm7hOH814iZUl0gqEfbLetHzxEY6QyGfzJfTOmhkaWdlc3RJRAFxZWxlbWVudElkZW50aWZpZXJvZG9jdW1lbnRfbnVtYmVybGVsZW1lbnRWYWx1ZWkxMTExMTExMTRqaXNzdWVyQXV0aIRPogEmBGoxMjM0NTY3ODkwoRghWQGAMIIBfDCCASGgAwIBAgIUEmmlElA5hRjuzPBe8u-gOO_EPVwwCgYIKoZIzj0EAwIwEzERMA8GA1UEAwwIVmVyaWZpZXIwHhcNMjQwODIxMDAzODE4WhcNMjQwOTIwMDAzODE4WjATMREwDwYDVQQDDAhWZXJpZmllcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCVM330iN-v1v58cWOv28j_LMEXupGyGuWwZOJI53ypUOk_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDGjUzBRMB0GA1UdDgQWBBQpvC5mfQK3FJzua7Pk0d00lPQRhDAfBgNVHSMEGDAWgBQpvC5mfQK3FJzua7Pk0d00lPQRhDAPBgNVHRMBAf8EBTADAQH_MAoGCCqGSM49BAMCA0kAMEYCIQCB3AhuOALOaW-5zDgL1mn-U-zGw8WS2zoDZySoC8oCzgIhAKothleK1BWfmpv1Qzy4bQ5-dUj-p2RXjGj_A4zcP_E2WQG32BhZAbKmZ3ZlcnNpb25jMS4wZ2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2bHZhbHVlRGlnZXN0c7kAAXFvcmcuaXNvLjE4MDEzLjUuMbkAAmEwWCCDmVdPXU868-AH_TQktvs6_XHec_SfEnCc5Z9MbRAOTWExWCB8XM3WYQ82VUEyinxL9G4_fL650UTLFU9IhrHxVASu9Gx2YWxpZGl0eUluZm-5AARmc2lnbmVkwHQyMDI1LTA0LTE1VDA1OjA2OjIyWml2YWxpZEZyb23AdDIwMjUtMDQtMTVUMDU6MDY6MjJaanZhbGlkVW50aWzAdDIwMjYtMDQtMTVUMDU6MDY6MjJabmV4cGVjdGVkVXBkYXRlwHQyMDI2LTA0LTE1VDA1OjA2OjIyWm1kZXZpY2VLZXlJbmZvuQABaWRldmljZUtlebkABGExAmItMlggwNsAsmHLtdQx6veWHIK5mSiUXMTq1Ay8BpBDUlZrpyZiLTNYIO2zZ5CmGJY1_mAJmCDh-EqfexFiewEGJPcPzZ0q4Ob5Yi0xAVhAU10IMazd3-WxcYisi3R_KB2NGpr9gCT-TTplUzo4P0h1I6qhC1xMPtWAU4KxeKmWOewTnLoD3nzb9aEJ7BEenmxkZXZpY2VTaWduZWS5AAJqbmFtZVNwYWNlc9gYQaBqZGV2aWNlQXV0aLkAAW9kZXZpY2VTaWduYXR1cmWET6IBJgRqMTIzNDU2Nzg5MKD2WEBejIRoXtdkUrPsgP9Otzys6_rZEwC4ZDno6FQdM678WnAjgDnOxu3pyiNwOyy39j0yBhDBvr7MSqakhgZkKmJVZnN0YXR1cwA';

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

    it('should verify IssuerSigned mdoc', async () => {
      const mdocVerifyHandler = new MdocVerifyHandlerImpl(schemas);
      const result = await mdocVerifyHandler.verify(mdoc);
      expect(result.valid).toBe(true);
    });
  });
});
