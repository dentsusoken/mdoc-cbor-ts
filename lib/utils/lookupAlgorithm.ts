import { Algorithms } from '@auth0/cose';

export const lookupAlgorithm = (number?: Algorithms) => {
  switch (number) {
    case -8:
      return 'EdDSA';
    case -7:
      return 'ES256';
    case -35:
      return 'ES384';
    case -36:
      return 'ES512';
    case -37:
      return 'PS256';
    case -38:
      return 'PS384';
    case -39:
      return 'PS512';
    case -257:
      return 'RS256';
    case -258:
      return 'RS384';
    case -259:
      return 'RS512';
    default:
      throw new Error('Invalid algorithm');
  }
};
