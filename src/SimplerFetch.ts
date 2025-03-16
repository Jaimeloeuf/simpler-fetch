import type { BaseUrlConfig } from "./types";
import { sfError } from "./errors";
import { MethodBuilder } from "./MethodBuilder";

export class SimplerFetch<
  const SimplerFetchConfig extends {
    baseUrlConfigs: Record<string, BaseUrlConfig>;

    /**
     * Set given identifier as the default baseUrlConfig to use so that you
     * can easily use this default mapping in your API calls.
     */
    defaultBaseUrlIdentifier?: keyof SimplerFetchConfig["baseUrlConfigs"];
  },
  const BaseUrlIdentifiers extends keyof SimplerFetchConfig["baseUrlConfigs"] = keyof SimplerFetchConfig["baseUrlConfigs"]
> {
  /**
   * Private property mapping urlId (Base URL Identifiers) to `MethodBuilder`.
   */
  readonly #urlIdToMethodBuilder = new Map<BaseUrlIdentifiers, MethodBuilder>();

  /**
   * Private property used to track default base URL identifier set by user.
   */
  readonly #defaultBaseUrlIdentifier?: BaseUrlIdentifiers;

  constructor(public readonly config: SimplerFetchConfig) {
    // Instead of creating a new `MethodBuilder` instance on every single call
    // to `useBaseUrl` method, a single `MethodBuilder` instance is created for
    // each baseUrlConfig on `SimplerFetch` creation for caching/optimisation
    // purposes. This is fine since `MethodBuilder` is idempotent.
    for (const [baseUrlIdentifier, baseUrlConfig] of Object.entries(
      config.baseUrlConfigs
    ) as Array<
      [
        BaseUrlIdentifiers,
        SimplerFetchConfig["baseUrlConfigs"][BaseUrlIdentifiers]
      ]
    >) {
      this.#urlIdToMethodBuilder.set(
        baseUrlIdentifier,
        new MethodBuilder({
          url: baseUrlConfig.url,
          defaultOptions: baseUrlConfig.defaultOptions ?? {},
          defaultHeaders: baseUrlConfig.defaultHeaders ?? [],
        })
      );
    }

    this.#defaultBaseUrlIdentifier =
      config.defaultBaseUrlIdentifier as BaseUrlIdentifiers;
  }

  /**
   * Use the default baseUrl set with `setDefaultBaseUrl`.
   */
  // The generic return type at compile time ensures whether user can access the
  // default base URL MethodBuilder.
  useDefaultBaseUrl(): "defaultBaseUrlIdentifier" extends keyof SimplerFetchConfig
    ? MethodBuilder
    : never {
    if (this.#defaultBaseUrlIdentifier === undefined) {
      throw new sfError("sf: Default identifier not set");
    }

    // Needs casting to ensure that it can work with the generic type.
    return this.useBaseUrl(
      this.#defaultBaseUrlIdentifier
    ) as "defaultBaseUrlIdentifier" extends keyof SimplerFetchConfig
      ? MethodBuilder
      : never;
  }

  /**
   * Use a base URL specified in the constructor.
   */
  useBaseUrl = (identifier: BaseUrlIdentifiers) =>
    // Non-null assertion operator can be safely used here as TS already
    // typechecks to ensure that the identifier passed in is a valid generic
    // `BaseUrlIdentifiers` string literal. This will only fail if user is not
    // using TS which is a case that we are not covering.
    this.#urlIdToMethodBuilder.get(identifier)!;

  /**
   * Use a Full URL string (with API path) to make an API call without using any
   * base URL.
   *
   * This method should be used when making one off API calls without having to
   * configure a base URL and its options. Usually used when you need to make an
   * API call to another domain, e.g. integrating with third party APIs.
   */
  useFullUrl = (fullUrlString: string) =>
    // Set generic type `IsFullUrl` to true to ensure that users are not allowed
    // to set `path` values, instead they have to set the full URL string here.
    new MethodBuilder<true>({
      url: fullUrlString,

      // A single use API call will always have empty default options/headers
      // since it cannot be used/reused again by definition.
      defaultOptions: {},
      defaultHeaders: [],
    });
}
