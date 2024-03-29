import { Builder } from "./Builder";
import { sfError } from "./errors";
import { skipValidation, jsonParser } from "./utils";

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
  /** Mapping of BaseURL specifiers to `Builder` instances. */
  static readonly #baseUrls: Map<string, Builder> = new Map();

  /**
   * Add a new baseUrl identifier and baseUrl mapping.
   * For example, you can add different baseUrls for your APIs such
   * as 'v1', 'v2', 'latest', 'billing' and etc...
   */
  static addBase(identifier: string, url: string) {
    if (sf.#baseUrls.has(identifier))
      throw new sfError(`sf.addBase: Identifier '${identifier}' already set`);

    sf.#baseUrls.set(identifier, new Builder(url));

    // Return itself so that users can chain other static methods.
    // This also allows users to call addBase a few times setting all identifier
    // and baseUrl mappings at once.
    return sf;
  }

  /**
   * Select a baseUrl to use, using a baseUrl identifier.
   * For example, you can select 'v1' baseUrl after adding it with `sf.addBase`
   */
  static useBase(identifier: string) {
    const builder = sf.#baseUrls.get(identifier);

    if (builder === undefined)
      throw new sfError(`sf.useBase: Identifier '${identifier}' not found`);

    return builder;
  }

  /**
   * Private property used to track default identifier set by user for the
   * `useDefault` method.
   */
  static #defaultIdentifier?: string;

  /**
   * Set a particular identifier and baseUrl mapping as the default mapping to
   * use so that you can easily use this default mapping in your API calls
   * without having to import and specify the identifier.
   */
  static setDefault(identifier: string) {
    if (!sf.#baseUrls.has(identifier))
      throw new sfError(`sf.setDefault: Identifier '${identifier}' not found`);

    sf.#defaultIdentifier = identifier;
  }

  /**
   * Use the default identifier and baseUrl mapping for an API call.
   */
  static useDefault() {
    if (sf.#defaultIdentifier === undefined)
      throw new sfError("sf.useDefault: Default identifier not set");

    return sf.useBase(sf.#defaultIdentifier);
  }

  /**
   * Use a Full URL string (with API path) to make an API call without using any
   * baseUrl.
   *
   * This method should be used when making one off API calls, without having to
   * set a `baseUrl` first. Usually used when you need to make an API call to
   * another domain. E.g. calling a third party API for some integration.
   */
  static useOnce = (fullUrlString: string) =>
    // Using arrow function for a smaller build output size
    new Builder(fullUrlString);

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
