import type { HTTPMethod } from "./types";
import type { ExpectedFetchConfig_for_UrlBuilder } from "./ChainableFetchConfig";
import { MethodBuilder } from "./MethodBuilder";

/**
 * Builder pattern class for users to use a base URL or a custom URL.
 */
export class UrlBuilder<
  const BaseUrlIdentifiers,
  const HTTPMethodUsed extends HTTPMethod
> {
  constructor(
    /**
     * Mapping of urlId (Base URL Identifiers) to `MethodBuilder`.
     */
    private readonly urlIdToMethodBuilder: Map<
      BaseUrlIdentifiers,
      MethodBuilder
    >,

    private readonly config: ExpectedFetchConfig_for_UrlBuilder
  ) {}

  /**
   * Use a base URL that is saved during `SimplerFetch` instance creation.
   */
  useSavedBaseUrl = (identifier: BaseUrlIdentifiers) =>
    // Non-null assertion operator can be safely used here as TS already
    // typechecks to ensure that the identifier passed in is a valid generic
    // `BaseUrlIdentifiers` string literal. This will only fail if user is not
    // using TS which is a case that we are not covering.
    this.urlIdToMethodBuilder.get(identifier)!;

  /**
   * Use a Full URL string (with API path) to make an API call without using any
   * base URL.
   *
   * This method should be used when making one off API calls without having to
   * configure a base URL and its options. Usually used when you need to make an
   * API call to another domain, e.g. integrating with third party APIs.
   */
  useUrl = (fullUrlString: string) =>
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
