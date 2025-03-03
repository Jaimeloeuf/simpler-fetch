import { Builder } from "./Builder";
import { sfError } from "./errors";
import { skipValidation, jsonParser } from "./utils";

/**
 * `Record<string, string>` mapping of baseUrlIdentifier (like v1) to baseUrl
 * (like http://localhost:3000/v1).
 *
 * ## Technical Details
 * 1. This has to be an interface to do interface merging across files.
 * 1. This should be `Record<string, string>` to derive BaseUrlIdentifiers /
 * BaseUrls from the key / value.
 *
 * ## Example type
 * ```typescript
 * declare module "simpler-fetch" {
 *   interface sf_BaseUrlObject {
 *     v1: string;
 *
 *     // Different base Urls can be useful for API service with different versions
 *     v2: string;
 *
 *     // It can also be useful for interfacing with external API
 *     stripeBilling: string;
 *   }
 * }
 * ```
 *
 * ## Example object
 * ```typescript
 * {
 *   v1: "http://localhost:3000/v1",
 *
 *   // Different base Urls can be useful for API versioning
 *   v2: "http://localhost:3000/v2",
 *
 *   // It can also be useful for interfacing with external API
 *   stripeBilling: "http://api.stripe.com/billing",
 * }
 * ```
 */
export interface sf_BaseUrlObject {}

/**
 * Derived type from `sf_BaseUrlObject` for a union type of string literals.
 */
export type sf_BaseUrlIdentifiers = keyof sf_BaseUrlObject;

/**
 * `sf` (simpler-fetch) is used to create an Object Oriented `Fetch` abstraction
 * to use the builder pattern to give users an easy to use chainable interface
 * to build their API calls.
 *
 * ## On Safety and Error handling
 * Note that although this library talks about safety, where errors are returned
 * instead of thrown, there is an exception to this case. All static methods on
 * this class is not safe since it can throw errors if anything goes wrong.
 *
 * Specifically, it throws the `sfError` class.
 *
 * The reason why this throws is to give high visibility to the issue because,
 * if there is an error here, it SHOULD NOT continue. This error will be thrown
 * when there is a library user caused configuration error and not a network/API
 * call related errors.
 *
 * This library is only safe when dealing with network/API call related errors.
 * It is advised to not wrap this in a try/catch block and just let the error
 * propagate so that you can see it and fix it before this goes to production!
 */
export class sf {
  /**
   * Mapping of BaseURL identifiers to `Builder` instances.
   */
  static readonly #baseUrls: Map<string, Builder> = new Map();

  /**
   * Set the baseUrl identifiers to baseUrls mapping. This has to follow the
   * augmented interface `sf_BaseUrlObject`, and this can only be called once.
   *
   * ## Example
   * ```typescript
   * sf.setBaseUrls({
   *   v1: "http://localhost:3000/v1",
   *
   *   // Different base Urls can be useful for API versioning
   *   v2: "http://localhost:3000/v2",
   *
   *   // It can also be useful for interfacing with external API
   *   stripeBilling: "http://api.stripe.com/billing",
   * });
   * ```
   */
  static setBaseUrls(baseUrls: sf_BaseUrlObject) {
    if (sf.#baseUrls.size !== 0) {
      throw new sfError(`sf: BaseUrls can only be set once`);
    }

    for (const [baseUrlIdentifier, baseUrl] of Object.entries(baseUrls)) {
      sf.#baseUrls.set(baseUrlIdentifier, new Builder(baseUrl));
    }

    // Return itself so that users can chain other static methods.
    return sf;
  }

  /**
   * Private property used to track default base URL identifier set by user.
   */
  static #defaultBaseUrlIdentifier?: sf_BaseUrlIdentifiers;

  /**
   * Set a particular identifier and baseUrl mapping as the default mapping to
   * use so that you can easily use this default mapping in your API calls.
   *
   * When called this overrides any previously set default baseUrl mapping, and
   * this method should ideally only be ever called once in your whole app.
   */
  static setDefaultBaseUrl(identifier: sf_BaseUrlIdentifiers) {
    if (!sf.#baseUrls.has(identifier)) {
      throw new sfError(`sf: Identifier '${identifier}' not found`);
    }

    sf.#defaultBaseUrlIdentifier = identifier;
  }

  /**
   * Use the default baseUrl set with `setDefaultBaseUrl`.
   */
  static useDefaultBaseUrl() {
    if (sf.#defaultBaseUrlIdentifier === undefined) {
      throw new sfError("sf: Default identifier not set");
    }

    return sf.useBaseUrl(sf.#defaultBaseUrlIdentifier);
  }

  /**
   * Use a baseUrl using its identifier, e.g. `v1`
   */
  static useBaseUrl(identifier: sf_BaseUrlIdentifiers) {
    const builder = sf.#baseUrls.get(identifier);

    if (builder === undefined) {
      throw new sfError(`sf: Identifier '${identifier}' not found`);
    }

    return builder;
  }

  /**
   * Use a Full URL string (with API path) to make an API call without using any
   * baseUrl.
   *
   * This method should be used when making one off API calls, without having to
   * set a `baseUrl` first. Usually used when you need to make an API call to
   * another domain. E.g. calling a third party API for some integration.
   */
  static useOnce = (fullUrlString: string) => new Builder(fullUrlString);

  /**
   * Utilities attached to `sf` so that users can access these without manually
   * importing them separately and potentially dealing with naming conflicts.
   */
  static readonly utils = {
    /**
     * Use this when validator function is required but you do not want to provide
     * one because it might not really matter to your use case.
     */
    skipValidation,

    /**
     * Utility function is used to parse Response data as json.
     */
    jsonParser,
  };
}
