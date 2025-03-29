import type { Header, ApiResponse } from "./types";
import type { ExpectedFetchConfig_for_Fetch } from "./ChainableFetchConfig";
import {
  TimeoutException,
  HeaderException,
  ValidationException,
} from "./exceptions";
import { safe } from "./utils/internal";

/**
 * Class used to configure `fetch` request options with the builder pattern
 * using a simple chainable interface before finally making the API call itself
 * using one of the methods prefixed with `run`.
 *
 * This **SHOULD NOT** be used by library users directly, this should be
 * constructed using the `Builder` class.
 */
export class Fetch<SuccessType, ErrorType> {
  /* Private Instance variables that are only accessible internally */

  /**
   * Instance variable for Query Params.
   *
   * This is not `readonly` since `useQuery` method will write to this variable.
   */
  #queryParams?: Record<string, string>;

  /**
   * Instance variable to set the `RequestInit` type options passed to the
   * `fetch` function.
   *
   * This is not `readonly` since a call to `useDefaultOptions` method will
   * cause a new options object to be created and assigned to this variable.
   */
  #options: RequestInit = {};

  /**
   * An array of `Header` to be reduced into a single Headers object before
   * being used in this instance's API call.
   *
   * This cannot be optional because in the `useHeader` method, it assumes that
   * `this.#headers` is already an array and inside the `#fetch` method it also
   * assumes that it is already an array by default when calling `map` on this.
   *
   * This is readonly since only the content of this headers array can be changed.
   */
  readonly #headers: Array<Header> = [];

  /**
   * Optional `AbortController` used for custom timeout set in `timeoutAfter()`
   */
  #abortController?: AbortController;

  /**
   * Optional timeout milliseconds for custom timeout set in `timeoutAfter()`
   */
  #timeoutInMilliseconds?: number;

  /**
   * Low level constructor API that should not be used by library users.
   * This is only used by the `MethodBuilder` class.
   */
  constructor(private readonly config: ExpectedFetchConfig_for_Fetch) {
  }

  /**
   * Method to get the full generated URL. Use to get the full URL after
   * constructing it to use for things like reflecting back to the URL.
   *
   * This will generate the full URL including any search params used.
   */
  getUrl(): string {
    // If not query params specified, return URL directly.
    if (this.#queryParams === undefined) {
      return this.config.url;
    }

    /* Generate URL by combining `#url` and query params set with `useQuery` */
    const url = new URL(this.config.url);

    // Create new query params by merging existing query params in the URL set
    // via the constructor and query params set using the `useQuery` method.
    const newQueryParams = new URLSearchParams([
      ...Array.from(url.searchParams.entries()),
      ...Object.entries(this.#queryParams),
    ]).toString();

    return `${url.origin}${url.pathname}?${newQueryParams}`;
  }

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
    this.#queryParams = queryParams as Record<string, string>;

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
  useDefaultOptions() {
    // Create new object for `this.#options` by combining the properties
    // `this.#defaultOptions` is spread first so that the API specific
    // options can override the default options.
    this.#options = { ...this.config.defaultOptions, ...this.#options };

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
   * Method to use default header(s) of the selected base Url for this specific
   * API call.
   *
   * You can override any default headers set through this method once off for
   * this specific API call with the `useHeader` method.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  useDefaultHeaders() {
    // `unshift` instead of `push`, because headers set first should be
    // overwritten by headers set later in `#fetch` header generation process.
    this.#headers.unshift(...this.config.defaultHeaders);

    // Deleting default headers by setting it to [] so that this method is
    // indempotent, making subsequent calls to `unshift` a no-op.
    // @ts-ignore @todo
    this.defaultHeaders = [];

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
    Object.assign(this.#options, options);
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
    this.#headers.push(...headers);
    return this;
  }

  /**
   * Use this method to set a custom timeout, instead of relying on brower
   * default timeouts like Chrome's 300 seconds default.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  timeoutAfter(timeoutInMilliseconds: number) {
    this.#timeoutInMilliseconds = timeoutInMilliseconds;
    this.#abortController = new AbortController();
    return this;
  }

  /**
   * ### About
   * This private method wraps the `fetch` function to make the API call after
   * all the values have been configured through chaining the instance methods.
   * This method should only be called by `#run` wrapper method which implements
   * the timeout logic.
   *
   * ### Method 'safety'
   * This is the underlying raw `fetch` function call that might throw an
   * exception when something goes wrong.
   *
   * ### Return type
   * The return type is unioned with `never` because this function can throw, ie
   * never return. However with TS, any value unioned with `never`, will be
   * itself, because checking for control flow is not enforced / not possible
   * with TS. Therefore this union with `never` is just used for documentation.
   */
  #fetch = async (): Promise<Response> | never =>
    fetch(this.getUrl(), {
      // Properties are set following the order of specificity:
      // 1. `RequestInit` options object is applied first
      // 2. HTTP method, which cannot be overwritten by `options`
      // 3. Instance specific headers, which cannot be overwritten by `options`
      // 4. Instance specific body data, which cannot be overwritten by `options`
      // 5. Instance specific timeout abortController's signal, which cannot be
      // overwritten by `options`.
      //
      // From this order, we can see that the values in `options` object cannot
      // override HTTP method set in the constructor, headers set with the
      // `useHeader` method and `body` set by any of the setRequestBody methods.

      // Apply with spread, since final object is the same `RequestInit` type
      ...this.#options,

      method: this.config.method,

      // Header generation process
      //
      // Run header functions if any to ensure array of headers is now an array
      // of header objects, the array of headers have the type of `object |
      // Promise<object>` because header generator functions can be async to let
      // users delay generating headers until API call. Use case include only
      // generating a very short lived token at the last minute before the API
      // call is made to ensure that it does not expire by the time it reaches
      // the API server.
      //
      // `await Promise.all` on the array of headers ensure all resolves before
      // reducing the array of header objects into a single header object.
      //
      // Using `Promise.all` instead of `Promise.allSettled` so that it will
      // stop running if any of the header generator function fails instead of
      // waiting for everything to complete since even if the rest resolves
      // they will be thrown away and not used, so no point awaiting on them.
      //
      // Any errors thrown here will be converted into `HeaderException` and get
      // bubbled up to the library user through the `safe` function wrapper.
      headers: (
        await Promise.all(
          this.#headers.map((header) =>
            typeof header === "function" ? header() : header
          )
        ).catch((err) => {
          // Wrap with HeaderException, see reasoning in `HeaderException` docs.
          throw new HeaderException(err);
        })
      ).reduce((obj, item) => ({ ...obj, ...item }), {}),

      // Because fetch's body property accepts many different types, instead
      // of doing transformations like JSON.stringify here, this library relies
      // on helper methods like `setRequestBodyWithJsonData` to set body as JSON
      // data type, and to also set the content-type and do any transformations
      // as needed.
      //
      // See `body` docs on its type
      body: this.config.body,

      // Using optional chaining as `#abortController` may be undefined if user
      // did not set a custom timeout with `timeoutAfter` method, if so, just
      // let it be undefined and it will just be ignored.
      signal: this.#abortController?.signal,
    });

  /**
   * ### About
   * This private method wraps the raw `#fetch` method to implement custom
   * timeout logic.
   *
   * ### Method 'safety'
   * This calls `#fetch` which might throw an exception when something goes
   * wrong, so use of this method should be wrapped with the `safe` function.
   *
   * ### Return type
   * See documentation for `#fetch` method for more info on the return type.
   *
   * This method's Function type signature mirrors the Function type signature
   * of the `#fetch` method since this method is just a wrapper over it to
   * implement timeout, whatever that is returned from `#fetch` is directly
   * returned to this method's caller.
   */
  async #fetchWithOptionalTimeout(): Promise<Response> | never {
    // If no custom timeout specified, run `#fetch` and return directly.
    if (this.#abortController === undefined) {
      return this.#fetch();
    }

    // Create new timeout using the custom timeout milliseconds value, and save
    // the timeoutID so that the timer can be cleared to skip this callback if
    // the API returns before the timeout.
    //
    // As TS notes, the `this.#abortController` variable could be changed and
    // became  undefined/null between the time that this setTimeout callback
    // function is defined and when this is triggered. Since there is no other
    // code that will modify this variable, its value can be safely assumed to
    // not be deleted when this callback is called, which means that the
    // non-null assertion operator can be used. However just to be extra safe,
    // an optional chaining operator is used instead, so in the event where it
    // is somehow undefined/null, this will not error out.
    //
    // If `this.#fetch` method call throws an exception that is not caused by
    // this timeout, for e.g. an exception caused by DNS failure, the call to
    // `clearTimeout` will be skipped and this abort method will still be
    // called even if the API call has already errored out. However this is
    // fine since calling abort after the API call completes will just be
    // ignored and will not throw a new error.
    const timeoutID = setTimeout(
      () =>
        this.#abortController?.abort(
          new TimeoutException(
            `${this.#timeoutInMilliseconds}ms time out exceeded`
          )
        ),
      this.#timeoutInMilliseconds
    );

    const res = await this.#fetch();

    // What if the fetch call errors out and this clearTimeout is not called?
    // If `this.#fetch` method call throws an Error that is not caused by the
    // abort signal, e.g. an error caused by DNS failure, this `clearTimeout`
    // call will be skipped and the timeout callback will still call the abort
    // method even if the API call has already errored out. However that is fine
    // since calling abort after the API call completes will just be ignored and
    // will not cause a new error.
    clearTimeout(timeoutID);

    // Return response from `#fetch` after completing timeout wrapper logic.
    return res;
  }

  /**
   * # Warning
   * This method is generally not used since this returns the raw HTTP Response
   * object. Library users should use the other run methods that also handles
   * response parsing, such as `runJSON`, `runFormData` and etc... This method
   * is made available as an escape hatch for library users who do not want the
   * library to do response parsing for them, so that they can build extra logic
   * on top of this library by getting the raw Response object back.
   *
   * This is `safe`, i.e. this method **will not throw** or let exceptions
   * bubble up so no try/catch wrapper block or .catch method is needed to
   * handle the jumping control flow of exceptions.
   *
   * @example Call API and handle any exception sequentially in the same scope
   * ```typescript
   * const [err, res] = await sf.useDefaultBaseUrl().GET("/api").run();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be the Response object
   * ```
   */
  runAndGetRawResponse() {
    return safe(() => this.#fetchWithOptionalTimeout());
  }

  /**
  async runAndThrowOnException() {
    const res = await this.#fetchWithOptionalTimeout();

    if (res.ok) {
      // Assume data to be generic `SuccessType` without validation so even if
      // no validator is passed in by the library user, it can be assumed that
      // the data is correctly shaped as `SuccessType` during compile time.
      //
      // If not annotated with the `SuccessType`, inference works for the most
      // part, but sometimes the type can end up as `Awaited<SuccessType>`.
      // This only affects the `runJSON` method where data is inferred as
      // `Awaited<SuccessType>` instead of `SuccessType`, which is technically
      // the same type, but confuses library users. This is probably caused by
      // .json value extraction returning `any` so the conversion here does
      // not properly take place.
      // Reference: https://github.com/microsoft/TypeScript/issues/47144
      //
      const data = (await this.config.responseParser(res)) as SuccessType;

      // Only run validation if a validator is passed in
      // User's validator can throw an exception, which will be safely bubbled
      // up to them if they want to receive a custom exception instead.
      // Throwing ValidationException instead of the generic Error class so
      // that users can check failure cause with `instanceof` operator.
      if (
        this.config.responseValidator !== undefined &&
        !this.config.responseValidator(data)
      ) {
        throw new ValidationException("Response validation Failed");
      }

      return {
        ok: true,
        status: res.status,
        headers: res.headers,
        data,
      } satisfies ApiResponse<SuccessType>;
    }

    // Parse error data, using `optionalErrorResponseParser` if available,
    // else default to `responseParser`.
    //
    // Assume data to be generic `ErrorType` without any validation so that it
    // can be assumed that the data is correctly shaped as `ErrorType` during
    // compile time because this library does not support validation for error
    // response data.
    //
    // Casting to `ErrorType` because even though inference works for the most
    // part, sometimes the type can end up as `Awaited<ErrorType>`. This only
    // affects the `runJSON` method where data is inferred as
    // `Awaited<ErrorType>` instead of `ErrorType`, which is technically the
    // same type, but confuses library users. This is probably caused by .json
    // value extraction returning `any` so the conversion here does not
    // properly take place.
    // Reference: https://github.com/microsoft/TypeScript/issues/47144
    const data = (await this.config.responseExceptionParser(res)) as ErrorType;

    // Only run validation if a validator is passed in
    // User's validator can throw an exception, which will be safely bubbled
    // up to them if they want to receive a custom exception instead.
    // Throwing ValidationException instead of the generic Error class so
    // that users can check failure cause with `instanceof` operator.
    if (
      this.config.responseExceptionValidator !== undefined &&
      !this.config.responseExceptionValidator(data)
    ) {
      throw new ValidationException("Response exception validation Failed");
    }

    return {
      ok: false,
      status: res.status,
      headers: res.headers,
      data,
    } satisfies ApiResponse<ErrorType>;
  }

  runSafely = () => safe(() => this.runAndThrowOnException());
}
