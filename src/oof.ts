import { Builder } from "./Builder";

/**
 * Class used to create an Object Oriented `Fetch` abstraction.
 * This uses the object oriented builder pattern to give users
 * an easy to use chainable interface to build their API calls.
 */
export class oof {
  /** Mapping of BaseURL specifiers to `Builder` instances. */
  static readonly #baseUrls: Map<string, Builder> = new Map();

  /**
   * Add a new baseUrl identifier and baseUrl mapping.
   * For example, you can add different baseUrls for your APIs such
   * as 'v1', 'v2', 'latest', 'billing' and etc...
   */
  static addBase(identifier: string, url: string) {
    if (oof.#baseUrls.has(identifier))
      throw new Error(`Identifier (${identifier}) must be unique`);

    oof.#baseUrls.set(identifier, new Builder(url));

    // Return itself so that users can chain other static methods.
    // This also allows users to call addBase a few times,
    // setting all the identifier and baseUrl mappings.
    return oof;
  }

  /**
   * Select a baseUrl to use, using a baseUrl identifier.
   * For example, you can select the 'v1' baseUrl after adding it
   * using the `addBase` static method.
   */
  static useBase(identifier: string) {
    const builder = oof.#baseUrls.get(identifier);

    if (builder === undefined)
      throw new Error(`Identifier (${identifier}) not found`);

    return builder;
  }

  /**
   * Private property used to track default identifier set by user to
   * use for the `useDefault` method.
   */
  static #defaultIdentifier?: string;

  /**
   * Set a particular identifier and baseUrl mapping as the default
   * mapping to use, so that you can easily use this default mapping in
   * your API calls without having to import and specify the identifier.
   */
  static setDefault(identifier: string) {
    if (!oof.#baseUrls.has(identifier))
      throw new Error(
        `Identifier (${identifier}) not found, cannot set as default`
      );

    oof.#defaultIdentifier = identifier;
  }

  /**
   * Use the default identifier and baseUrl mapping for an API call.
   */
  static useDefault() {
    if (oof.#defaultIdentifier === undefined)
      throw new Error("Cannot 'useDefault' as default identifier not set");

    return oof.useBase(oof.#defaultIdentifier);
  }

  /**
   * Use a Full URL string (with API path) to make an API call without using any baseUrl.
   *
   * This method should be used when making one off API calls, without having to set
   * a `baseUrl` first. Usually used when you need to make an API call to another domain.
   * E.g. calling a third party API for some integration.
   */
  static useOnce(fullUrlString: string) {
    return new Builder(fullUrlString);
  }
}
