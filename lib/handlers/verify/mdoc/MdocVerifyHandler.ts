export interface MdocVerifyHandler {
  verify: (mdoc: string) => Promise<boolean>;
}
