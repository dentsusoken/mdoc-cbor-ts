import process from 'process';
import { EnvLoader } from './EnvLoader';

describe('EnvLoader', () => {
  describe('load', () => {
    it('should set the environment', () => {
      EnvLoader.load(process.env);
      expect(EnvLoader.getEnv('OS', '')).toBe(process.env.OS);
    });
  });
  describe('getEnv', () => {
    it('should return the value of the key', () => {
      const env = { key: 'value' };
      EnvLoader.load(env);
      expect(EnvLoader.getEnv('key', 'default')).toBe('value');
    });
    it('should return the default value if the key is not found', () => {
      const env = { key: 'value' };
      EnvLoader.load(env);
      expect(EnvLoader.getEnv('missing', 'default')).toBe('default');
    });
  });
});
