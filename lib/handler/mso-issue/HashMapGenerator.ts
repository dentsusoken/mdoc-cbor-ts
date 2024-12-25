import { HashMap, EncodedNameSpaces } from '../../schemas';
import { encode } from 'cbor-x';
import { MsoIssuerConfig } from './MsoIssueHandlerImpl';

export type HashMapGenerator = (data: EncodedNameSpaces) => Promise<HashMap>;

export const createDefaultHashMapGenerator = (
  config: MsoIssuerConfig
): HashMapGenerator => {
  return async (data) => {
    const hashMap: HashMap = {};
    for (const [key, value] of Object.entries(data)) {
      hashMap[key] = {};
      for (const item of value) {
        const digest = await crypto.subtle.digest(
          config.HASH_ALGORITHM,
          encode(item)
        );
        hashMap[key][item.value.digestID] = digest;
      }
    }
    return hashMap;
  };
};
