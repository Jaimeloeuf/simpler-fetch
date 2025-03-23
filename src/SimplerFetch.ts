import type { BaseUrlConfig } from "./types";
import { MethodBuilder } from "./MethodBuilder";

/**
 * `SimplerFetch` is used to create an Object Oriented `fetch api` abstraction
 * to give users an easy to use chainable interface (builder pattern) to build
 * their API calls.
 */
export class SimplerFetch<
  const SimplerFetchConfig extends {
    baseUrlConfigs: Record<string, BaseUrlConfig>;
  },
  const BaseUrlIdentifiers extends keyof SimplerFetchConfig["baseUrlConfigs"] = keyof SimplerFetchConfig["baseUrlConfigs"]
> {
  /**
   * Private property mapping urlId (Base URL Identifiers) to `MethodBuilder`.
   */
  readonly #urlIdToMethodBuilder = new Map<BaseUrlIdentifiers, MethodBuilder>();

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
