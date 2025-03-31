import type { HTTPMethod } from "./types";
import type {
  ExpectedFetchConfig_for_UrlBuilder,
  ExpectedFetchConfig_for_PathBuilder,
} from "./ChainableFetchConfig";
import { PathAndQueryParamsBuilder } from "./PathAndQueryParamsBuilder";

/**
 * Builder pattern class for users to use a custom URL.
 */
export class UrlBuilder<const HTTPMethodUsed extends HTTPMethod> {
  constructor(private readonly config: ExpectedFetchConfig_for_UrlBuilder) {}

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
