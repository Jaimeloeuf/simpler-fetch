import type { Header } from "./types";
import type {
  ExpectedFetchConfig_for_OtherFetchConfigBuilder,
  ExpectedFetchConfig_for_Fetch,
} from "./ChainableFetchConfig";
import { Fetch } from "./NewFetch";

/**
 * Builder pattern class for users to configure other options like timeout and
 * etc... before making the actual fetch API call.
 */
export class OtherFetchConfigBuilder<SuccessType, ErrorType> {
  constructor(
    private readonly config: ExpectedFetchConfig_for_OtherFetchConfigBuilder
  ) {}

  /**
   * Method to add Query Params to the final URL.
   *
   * Note that any query params set here will be merged/added to any existing
   * query params set via the URL Path string directly, and query params set
   * here will appear **after** the existing query params.
   *
   * The query params are also lazily merged, either when the fetch call is just
   * about to run and it calls `getUrl`, or if library user calls `getUrl`.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  useQuery<
    T extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >
  >(queryParams: T) {
    // Remove all undefined values so that the default type can accept optional
    // values without having undefined be in the final generated query params.
    Object.keys(queryParams).forEach(
      (key) => queryParams[key] === undefined && delete queryParams[key]
    );

    // Type cast needed here since TSC cannot infer the removal of undefined
    // values from the Record type.
    this.config.queryParams = queryParams as Record<string, string>;

    return this;
  }

  /**
   * Method to use default `RequestInit` object of the selected base Url for
   * this specific API call.
   *
   * You can override any default options set through this method once off for
   * this specific API call with the `useOptions` method.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  useDefaultOptionsForBaseUrl() {
    // Create new object for `options` by combining the properties.
    // `defaultOptions` is spread first so that the API specific options can
    // override the default options.
    this.config.options = {
      ...this.config.defaultOptions,
      ...this.config.options,
    };

    // Alternative method using `Object.assign` transpiles to more bytes.
    //
    // Object.assign overwrite properties in target object if source(s) have
    // properties of the same key. Later sources' properties also overwrite
    // earlier ones. Since Fetch instance specific options should be able to
    // override default options, default options has to come first in the list
    // of sources. Since default options should not be modified, both the
    // sources should be combined together and have their properties copied into
    // a new empty object, before the new object is returned, and set as the new
    // `#options` object.
    // this.#options = Object.assign({}, this.#defaultOptions, this.#options);

    // Delete default options by setting it to {} so that this method is
    // indempotent, making subsequent spread calls effectively a no-op.
    //
    // However, this is technically not needed, since the options above are
    // indempotent in the sense that it will always generate the same options
    // object even after the first time, as the `#options` object will contain
    // all the keys that were only set in `#defaultOptions` after the first use.
    // The only difference is that, by setting it to {}, it will technically be
    // more efficient since it does not need to do any extra computation,
    // however it will increase the library size, and the library users are not
    // expected to call this more than once anyways, so this is not used.
    // this.#defaultOptions = {};

    return this;
  }

  /**
   * Method to set `RequestInit` object for this one API call.
   *
   * ### When to use this method?
   * Use this to set custom RequestInit parameters for this specific one-off API
   * call. See below on when should you use this method.
   *
   * Note that options set with this method cannot override the headers set with
   * the `useHeader` method, cannot override HTTP `method` via constructor and
   * cannot override the body value set by any of the 'body' methods.
   *
   * Which is why:
   * - If you want to set request body, use `setRequestBody` or
   *   `setRequestBodyWithJsonData` method.
   * - If you need to set a request header, use the `.useHeader` method.
   * - If you want to set HTTP request method, use a static method on `Builder`
   *
   * Do not use this unless you have a specific option to pass in e.g. cache:
   * "no-cache" for this one specific API call only and nothing else. If there
   * are options that you want to set for all API request calls, use `Builder`'s
   * `.setDefaultOptions` method instead. Note that any options value set using
   * this method will also override the default options set.
   *
   * This method merges the provided options with the previously set options, so
   * default options can be overridden there. Note that this is a shallow merge
   * and not a deepmerge.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  useOptions(options: RequestInit) {
    // Use Object.assign to mutate original object instead of creating a new one
    // Spread syntax is not used since it transpiles to more bytes
    // this.#options = { ...this.#options, ...options };
    Object.assign(this.config.options, options);
    return this;
  }

  /**
   * Method to use default header(s) of the selected base Url for this specific
   * API call.
   *
   * You can override any default headers set through this method once off for
   * this specific API call with the `useHeader` method.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  useDefaultHeadersForBaseUrl() {
    // `unshift` instead of `push`, because headers set first should be
    // overwritten by headers set later in `#fetch` header generation process.
    this.config.headers.unshift(...this.config.defaultHeaders);

    // Deleting default headers by setting it to [] so that this method is
    // indempotent, making subsequent calls to `unshift` a no-op.
    // @ts-ignore @todo
    this.defaultHeaders = [];

    return this;
  }

  /**
   * Add Header(s) to include in the API call.
   *
   * Accepts plain header objects, functions and async functions.
   *
   * Functions passed in will be called right before the API call to generate a
   * header object, to delay generating certain header values like a time
   * limited auth token or recaptcha.
   *
   * This method can be called multiple times, and all the header objects will
   * be combined. If there are duplicate headers, the latter will be used.
   *
   * If you prefer, this method is a variadic function that accepts multiple
   * arguments of the same type so that you can call this method just once if
   * you have all the headers instead of invoking this method multiple times.
   *
   * The function parameter forces the caller to pass in at least one argument
   * for this variadic method. See https://stackoverflow.com/a/72286990
   *
   * @returns Returns the current instance to let you chain method calls
   */
  useHeader(...headers: [Header, ...Header[]]) {
    this.config.headers.push(...headers);
    return this;
  }

  /**
   * Use this method to set a custom timeout, instead of relying on brower
   * default timeouts like Chrome's 300 seconds default.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  timeoutAfter(timeoutInMilliseconds: number) {
    this.config.timeoutInMilliseconds = timeoutInMilliseconds;
    this.config.abortController = new AbortController();
    return this;
  }

  /**
   * Mark the completion of all configuration, and call finishConfig to call
   * the `Fetch` class for it to actually run the API call.
   */
  finishConfig = () =>
    new Fetch<SuccessType, ErrorType>(
      this.config as ExpectedFetchConfig_for_Fetch
    );
}
