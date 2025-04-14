import type { HTTPMethod, BaseUrlConfig } from "./types";
import type {
  ChainableFetchConfig,
  ExpectedFetchConfig_for_UrlBuilder,
  ExpectedFetchConfig_for_PathAndQueryParamsBuilder,
} from "./fetch-config";
import { PathAndQueryParamsBuilder } from "./PathAndQueryParamsBuilder";

/**
 * Builder pattern class for users to use a saved base URL or a custom URL.
 */
export class UrlBuilder<
  const BaseUrlIdentifiers extends string | number | symbol,
  const HTTPMethodUsed extends HTTPMethod
> {
  constructor(
    private readonly config: ExpectedFetchConfig_for_UrlBuilder,
    private readonly baseUrlConfigs: Record<BaseUrlIdentifiers, BaseUrlConfig>
  ) {}

  #ChainToPathAndQueryParamsBuilder(
    url: Exclude<ChainableFetchConfig["url"], undefined>,
    defaultOptions: Exclude<
      ChainableFetchConfig["defaultOptions"],
      undefined
    > = {},
    defaultHeaders: Exclude<
      ChainableFetchConfig["defaultHeaders"],
      undefined
    > = []
  ) {
    this.config.url = url;
    this.config.defaultOptions = defaultOptions;
    this.config.defaultHeaders = defaultHeaders;
    return new PathAndQueryParamsBuilder<HTTPMethodUsed>(
      this.config as ExpectedFetchConfig_for_PathAndQueryParamsBuilder
    );
  }

  /**
   * Use a base URL that is saved during `SimplerFetch` instance creation.
   */
  useSavedBaseUrl = (identifier: BaseUrlIdentifiers) =>
    this.#ChainToPathAndQueryParamsBuilder(
      this.baseUrlConfigs[identifier].url,
      this.baseUrlConfigs[identifier].defaultOptions,
      this.baseUrlConfigs[identifier].defaultHeaders
    );

  /**
   * Use given url string as base URL to make an API call.
   *
   * This method should be used when making one off API calls without having to
   * configure a base URL and its options. Usually used when you need to make an
   * API call to another domain, e.g. integrating with third party APIs.
   */
  useUrl = (url: string) => this.#ChainToPathAndQueryParamsBuilder(url);
}
