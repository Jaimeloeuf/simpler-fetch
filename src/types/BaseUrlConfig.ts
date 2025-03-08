import type { Header } from "./Header";

/**
 * Configurations for each base URL
 */
export type BaseUrlConfig = {
  /**
   * This is the actual base URL string
   */
  readonly url: string;

  /**
   * Default options that will be applied to all API calls of this base URL.
   * These options can be overwritten one-off in specific API calls with the
   * `useOptions` method of `Fetch` class.
   *
   * Useful for doing things like setting the 'mode' of the request, e.g., cors,
   * no-cors, or same-origin. Use the link to see all the default options that
   * you can set like mode/credentials/cache/redirect:
   * https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
   */
  readonly defaultOptions?: RequestInit;

  /**
   * Default headers that will be applied to all API calls of this base URL.
   * These headers can be overwritten one-off in specific API calls with the
   * `useHeader` method of `Fetch` class.
   *
   * Useful for doing things like passing in a function to generate auth header,
   * so that the function does not need to be passed in for every API call made
   * with the `Fetch` instance.
   */
  readonly defaultHeaders?: Array<Header>;
};

/**
 * Extends `BaseUrlConfig` to make every field required
 */
export type BaseUrlConfigWithOptionalDefaults = Required<BaseUrlConfig>;
