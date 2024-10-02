/**
 * Helper class to load environment variables.
 * Basically a wrapper around process.env.
 *
 * This class can also be used to load environment variables from objects other than process.env,
 * such as in environments like Cloudflare Workers. In such cases, use the load method.
 */
export class EnvLoader {
  /**
   * Holds the loaded environment variables.
   * @type {Record<string, string | undefined>}
   */
  static #env: Record<string, string | undefined> = {};

  /**
   * Loads environment variables from the provided object.
   * Use this method when you need to load environment variables from objects other than process.env.
   *
   * @param {Record<string, string | undefined>} env - The object from which to load the environment variables.
   */
  static load(env: Record<string, string | undefined>) {
    this.#env = env;
  }

  /**
   * Gets the value of the specified environment variable.
   *
   * @param {string} key - The name of the environment variable.
   * @param {T} defaultValue - The value to return if the environment variable is not set.
   * @returns {string | T} - The value of the environment variable, or the default value if the environment variable is not set.
   */
  static getEnv<T>(key: string, defaultValue: T): string | T {
    return this.#env[key] ?? process.env[key] ?? defaultValue;
  }
}
