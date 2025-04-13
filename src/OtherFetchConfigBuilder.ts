import type { Header } from "./types";
import type {
  ExpectedFetchConfig_for_OtherFetchConfigBuilder,
  ExpectedFetchConfig_for_Fetch,
} from "./ChainableFetchConfig";
import { Fetch } from "./Fetch";
import { SimplerFetchError } from "./errors";

/**
 * Builder pattern class for users to configure other options like timeout and
 * etc... before making the actual fetch API call.
 */
export class OtherFetchConfigBuilder<
  ResponseDataType,
  ResponseExceptionDataType
> {
  constructor(
    private readonly config: ExpectedFetchConfig_for_OtherFetchConfigBuilder
  ) {
    // Add in content-type header if user set it previously
    if (this.config.optionalContentType !== undefined) {
      this.useHeader({ "Content-Type": this.config.optionalContentType });
    }
  }

  #isDefaultOptionsApplied: boolean = false;

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
    if (this.#isDefaultOptionsApplied) {
      throw new SimplerFetchError(
        `'${OtherFetchConfigBuilder.prototype.useDefaultOptionsForBaseUrl.name}' can only be called once`
      );
    }

    // Create new object for `options` by combining the properties.
    // `defaultOptions` is spread first so that the API specific options can
    // override the default options.
    this.config.options = {
      ...this.config.defaultOptions,
      ...this.config.options,
    };

    this.#isDefaultOptionsApplied = true;
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

  #isDefaultHeadersApplied: boolean = false;

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
    if (this.#isDefaultHeadersApplied) {
      throw new SimplerFetchError(
        `'${OtherFetchConfigBuilder.prototype.useDefaultHeadersForBaseUrl.name}' can only be called once`
      );
    }

    // `unshift` instead of `push`, because we want to allow API call specific
    // headers to override default headers, and headers set first in the array
    // will be overwritten by headers of the same key set later in the header
    // object generation process.
    this.config.headers.unshift(...this.config.defaultHeaders);

    this.#isDefaultHeadersApplied = true;
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
   * ### DO NOT SET "Content-Type" manually
   * If you set a request body previously using `setRequestBody` or
   * `setRequestBodyWithJsonData`, the content-type header will be set for you
   * automatically. Do not set to avoid wrongly overriding it.
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
    if (this.config.timeoutInMilliseconds !== undefined) {
      throw new SimplerFetchError(
        `'${OtherFetchConfigBuilder.prototype.timeoutAfter.name}' can only be called once`
      );
    }

    this.config.timeoutInMilliseconds = timeoutInMilliseconds;
    this.config.abortController = new AbortController();
    return this;
  }

  /**
   * Mark the completion of all configuration, and call finishConfig to call
   * the `Fetch` class for it to actually run the API call.
   */
  finishConfig = () =>
    new Fetch<ResponseDataType, ResponseExceptionDataType>(
      this.config as ExpectedFetchConfig_for_Fetch
    );
}
