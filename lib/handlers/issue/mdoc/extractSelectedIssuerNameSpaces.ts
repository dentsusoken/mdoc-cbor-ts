import { IssuerNameSpaces } from "@/schemas/mdoc/IssuerNameSpaces";
import { DataElementsArray } from "@/schemas/mso";

export const extractSelectedIssuerNameSpaces = (
  nameSpaces: IssuerNameSpaces,
  dataElementsArray: DataElementsArray
): => {
  return Object.fromEntries(
    Object.entries(nameSpaces).filter(([nameSpace, issuerSignedItemBytesArray]) =>
      dataElementsArray.includes(nameSpace)
    )
  );
};