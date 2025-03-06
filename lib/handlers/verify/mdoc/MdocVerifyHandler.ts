export type ValidNameSpace = {
  [nameSpace: string]: {
    [elementIdentifier: string]: unknown;
  };
};

export type ValidDocuments = {
  [docType: string]: ValidNameSpace;
};

export type MdocVerifyResult =
  | { valid: true; documents: ValidDocuments }
  | { valid: false };

export interface MdocVerifyHandler {
  verify: (mdoc: string) => Promise<MdocVerifyResult>;
}
