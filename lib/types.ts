// TODO - specify the types for DisclosureMap
export type DisclosureMap = Record<string, Record<number, unknown>>;
export type HashMap = Record<string, Record<number, unknown>>;
export type Dict = Record<string, unknown>;
export type MdocData = {
  doctype?: string;
  data: Dict;
};
