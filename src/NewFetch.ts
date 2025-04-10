import type { ApiResponse } from "./types";
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
export class Fetch<ResponseDataType, ResponseExceptionDataType> {
  /**
   * Low level constructor API that should not be used by library users.
   * This is only used by the `MethodBuilder` class.
   */
  constructor(private readonly config: ExpectedFetchConfig_for_Fetch) {}

  /**
   * Method to get the full generated URL. Use to get the full URL after
   * constructing it to use for things like reflecting back to the URL.
   *
   * This will generate the full URL including any search params used.
   */
  getUrl() {
    // Using string concat instead of URL constructor path, base combo like
    // new URL(this.config.path, this.config.url) allows us to use base URLs
    // with non empty paths like https://example.com/v1 as using URL constructor
    // with a path /hello will override and remove the /v1
    //
    // The main reason for using URL constructor instead of just the string
    // concat and doing manual string manipulation for search params is so that
    // we can use URL constructor to validate if the concatenated URL is valid.
    const url = new URL(this.config.url + this.config.path);

    // If not query params specified, return URL directly.
    if (this.config.queryParams === undefined) {
      return url.href;
    }

    // Create new query params by merging existing query params in the URL and
    // the custom query params object.
    url.search = new URLSearchParams([
      ...Array.from(url.searchParams.entries()),
      ...Object.entries(this.config.queryParams),
    ]).toString();

    return url.href;
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
      ...this.config.options,

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
          this.config.headers.map((header) =>
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
      signal: this.config.abortController?.signal,
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
    if (this.config.abortController === undefined) {
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
        this.config.abortController?.abort(
          new TimeoutException(
            `${this.config.timeoutInMilliseconds}ms time out exceeded`
          )
        ),
      this.config.timeoutInMilliseconds
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
    const rawResponse = await this.#fetchWithOptionalTimeout();

    if (rawResponse.ok) {
      // Assume data to be generic `ResponseDataType` without validation so even
      // if no validator is passed in by the library user, it can be assumed
      // that the data is correctly shaped as `ResponseDataType` on compile.
      //
      // If not annotated with `ResponseDataType`, inference mostly works, but
      // sometimes the type can end up as `Awaited<ResponseDataType>`. This only
      // affects the `runJSON` method where data is inferred as
      // `Awaited<ResponseDataType>` instead of `ResponseDataType`, which is
      // technically the same type, but confuses library users. This is probably
      // caused by .json value extraction returning `any` so the conversion here
      // does not properly take place.
      // Reference: https://github.com/microsoft/TypeScript/issues/47144
      //
      const data = (await this.config.responseParser(
        rawResponse
      )) as ResponseDataType;

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
        status: rawResponse.status,
        headers: rawResponse.headers,
        data,
        rawResponse,

        // Assume that as long as validator exists it will be ran
        didValidatorRun: this.config.responseValidator !== undefined,
      } satisfies ApiResponse<ResponseDataType>;
    }

    // Parse error data, using `optionalErrorResponseParser` if available,
    // else default to `responseParser`.
    //
    // Assume data to be generic `ResponseExceptionDataType` without validation
    // so even if no validator is passed in by the library user, it can be
    // assumed that the data is correctly shaped as `ResponseExceptionDataType`
    // on compile.
    //
    // Casting to `ResponseExceptionDataType` because even though inference
    // mostly works, sometimes the type can end up as `Awaited<ResponseExceptionDataType>`.
    // This only affects the `runJSON` method where data is inferred as
    // `Awaited<ResponseExceptionDataType>` instead of `ResponseExceptionDataType`,
    // which is technically the same type, but confuses library users. This is
    // probably caused by .json value extraction returning `any` so the
    // conversion here does not properly take place.
    // Reference: https://github.com/microsoft/TypeScript/issues/47144
    const data = (await this.config.responseExceptionParser(
      rawResponse
    )) as ResponseExceptionDataType;

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
      status: rawResponse.status,
      headers: rawResponse.headers,
      data,
      rawResponse,

      // Assume that as long as validator exists it will be ran
      didValidatorRun: this.config.responseExceptionValidator !== undefined,
    } satisfies ApiResponse<ResponseExceptionDataType>;
  }

  runSafely = () => safe(() => this.runAndThrowOnException());
}
