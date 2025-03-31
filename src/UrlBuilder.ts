import type { HTTPMethod, BaseUrlConfig } from "./types";
import type {
  ExpectedFetchConfig_for_UrlBuilder,
  ExpectedFetchConfig_for_PathBuilder,
} from "./ChainableFetchConfig";
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

  /**
   * Use a base URL that is saved during `SimplerFetch` instance creation.
   */
  useSavedBaseUrl(identifier: BaseUrlIdentifiers) {
    this.config.url = this.baseUrlConfigs[identifier].url;
    this.config.defaultOptions = this.baseUrlConfigs[identifier].defaultOptions;
    this.config.defaultHeaders = this.baseUrlConfigs[identifier].defaultHeaders;
    return new PathAndQueryParamsBuilder<HTTPMethodUsed>(
      this.config as ExpectedFetchConfig_for_PathBuilder
    );
  }

  /**
   * Use given url string as base URL to make an API call.
   *
   * This method should be used when making one off API calls without having to
   * configure a base URL and its options. Usually used when you need to make an
   * API call to another domain, e.g. integrating with third party APIs.
   */
  useUrl(url: string) {
    this.config.url = url;
    return new PathAndQueryParamsBuilder<HTTPMethodUsed>(
      this.config as ExpectedFetchConfig_for_PathBuilder
    );
  }
}
