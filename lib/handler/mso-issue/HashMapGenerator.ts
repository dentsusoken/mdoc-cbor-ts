import { HashMap, NameSpace } from '../../schemas';
import { encode, Tag } from 'cbor-x';
import { MsoIssuerConfig } from './MsoIssueHandlerImpl';

export type HashMapGenerator = (data: NameSpace) => Promise<HashMap>;

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
          encode(new Tag(encode(item.value), 24))
        );
        hashMap[key][item.value.digestID] = digest;
      }
    }
    return hashMap;
  };
};
