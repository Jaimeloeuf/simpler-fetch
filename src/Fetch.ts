import type {
  Header,
  HTTPMethod,
  ApiResponse,
  Validator,
  JsonTypeAlias,
  JsonResponse,
} from "./types";
import {
  TimeoutException,
  HeaderException,
  ValidationException,
} from "./exceptions";
import { safe } from "./safe";

import { Fetch2 } from "./Fetch2";

type ResponseParser<T> = (res: Response) => Promise<T>;

/**
 * Class used to configure `fetch` request options with the builder pattern
 * using a simple chainable interface before finally making the API call itself
 * using one of the methods prefixed with `run`.
 *
 * This **SHOULD NOT** be used by library users directly, this should be
 * constructed using the `Builder` class.
 */
export class Fetch<ErrorType, ResponseType> {
  /* Private Instance variables that are only accessible internally */

  /**
   * Instance variable to set the HTTP method used for the API call.
   */
  readonly #method: HTTPMethod;

  /**
   * This is the full URL path of the API endpoint to make the request, which
   * can either be a relative or absolute URL path accepted by `fetch`.
   */
  readonly #url: string;

  /**
   * Instance variable to hold the default `RequestInit` options object for the
   * specified base url, which is only used if the library user chooses to use
   * the default options object using the `useDefaultOptions` method.
   */
  readonly #defaultOptions: RequestInit;

  /**
   * Instance variable to set the `RequestInit` type options passed to the
   * `fetch` function.
   *
   * This is not `readonly` since a call to `useDefaultOptions` method will
   * cause a new options object to be created and assigned to this variable.
   */
  #options: RequestInit = {};

  /**
   * Instance variable to hold the default `headers` array for the specified
   * base Url, which is only used if the library user chooses to use the default
   * headers using the `useDefaultHeaders` method.
   *
   * This is not `readonly` since this will be reset to an empty array after
   * calling `useDefaultHeaders` method to keep the method indempotent.
   */
  #defaultHeaders: Array<Header>;

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
   * The `body` field will be used for the `body` property of `fetch` call.
   *
   * Due to the huge variety of argument types accepted by `BodyInit | null` and
   * the lack of a standard TypeScript interface/type describing it, this is
   * explicitly typed as `any`, which means that this type is basically anything
   *  that can be serialized by JSON.stringify and also any child types of
   * `BodyInit | null`.
   *
   * References:
   * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
   * - https://tc39.es/ecma262/#sec-json.stringify
   */
  #body?: any;

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
   * This is only used by the `Builder` class.
   */
  constructor(
    readonly method: HTTPMethod,
    url: string,
    defaultOptions: RequestInit,
    defaultHeaders: Array<Header>
  ) {
    this.#method = method;
    this.#url = url;
    this.#defaultOptions = defaultOptions;
    this.#defaultHeaders = defaultHeaders;
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
  useDefaultOptions(): Fetch<unknown, unknown> {
    // Create new object for `this.#options` by combining the properties
    // `this.#defaultOptions` is spread first so that the API specific
    // options can override the default options.
    this.#options = { ...this.#defaultOptions, ...this.#options };

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
  useDefaultHeaders(): Fetch<unknown, unknown> {
    // `unshift` instead of `push`, because headers set first should be
    // overwritten by headers set later in `#fetch` header generation process.
    this.#headers.unshift(...this.#defaultHeaders);

    // Deleting default headers by setting it to [] so that this method is
    // indempotent, making subsequent calls to `unshift` a no-op.
    this.#defaultHeaders = [];

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
   * - If you want to set request body, use `.body` or `.bodyJSON` method.
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
  useOptions(options: RequestInit): Fetch<unknown, unknown> {
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
  useHeader(...headers: [Header, ...Header[]]): Fetch<unknown, unknown> {
    this.#headers.push(...headers);
    return this;
  }

  /**
   * Use this method to set a custom timeout, instead of relying on brower
   * default timeouts like Chrome's 300 seconds default.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  timeoutAfter(timeoutInMilliseconds: number): Fetch<unknown, unknown> {
    this.#timeoutInMilliseconds = timeoutInMilliseconds;
    this.#abortController = new AbortController();
    return this;
  }

  /* All methods for setting body starts with the word 'body' */

  /**
   * Set request body to be sent to server for HTTP methods such as POST/PUT.
   *
   * ### When to use this method?
   * For most users who want to send JSON data to the server, see the `bodyJSON`
   * method instead. For other types of data like `FormData`, `Blob`, `streams`
   * just pass it into this method as the `body` parameter and the content type
   * will be automatically detected / set by the `fetch` function.
   *
   * ### Why have both `body` and `bodyJSON` method?
   * The reason for this method instead of just having `bodyJSON` only is
   * because the library cannot always just assume that library users only use
   * JSON data, and have to support data types like FormData, Blob and etc...
   * However the problem is that when content-type is not set, `fetch` will try
   * to guess it, but when body is the results of `JSON.stringify(this.#body)`,
   * fetch will guess the content-type to be text/plain and the browser will
   * treat it as a safe CORS request, which means that for that request there
   * will be no pre-flight request sent. Which means that the browser prevents
   * certain headers from being used, which might cause an issue, and also the
   * server may not always respond correctly because they assume they got
   * text/plain even though your API endpoint is for application/json.
   *
   * The type of `body` value can be anything, as you can pass in any value that
   * the `fetch` API's `RequestInit`'s body property accepts.
   *
   * ### Using generics for TS Type Safety
   * ```typescript
   * const { res, err } = await sf
   *   .useDefault()
   *   .POST("/api")
   *   .body<FormData>(myValue) // TS will enforce that myValue is FormData
   *   .runJSON();
   * ```
   * The above code sets the body type for type safety.
   *
   * For TS users, the body type is a generic type variable even though its
   * default type for it is `any` so that you can use it to restrict the type
   * passed into the method. This allows you to enforce type safety where once a
   * generic type is set, you know that the value passed in for the `body`
   * parameter cannot be any other type.
   *
   * ### On `optionalContentType`'s type safety
   * Note on `optionalContentType`'s type: Although it is possible to create a
   * union type of all allowed string literals for the content-type header /
   * mime types, it is not very feasible as it is a very big list that will be
   * updated in the future. Therefore users are expected to make sure that any
   * string they pass is valid.
   * References on all supported content-type values:
   * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
   * - https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header/48704300#48704300
   * - https://www.iana.org/assignments/media-types/media-types.xhtml
   *
   * @returns Returns the current instance to let you chain method calls
   */
  body<RequestBodyType = any>(
    body: RequestBodyType,
    optionalContentType?: string
  ): Fetch<unknown, unknown> {
    // Only add in the content-type header if user chooses to set it,
    // Ref:
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#body
    // Quoting the above link's last line: "... the fetch() function will try to
    // intelligently determine the content type. A request will automatically
    // set a Content-Type header if none is set in the dictionary."
    //
    // This means that if none is passed in, fetch API's implementation will
    // guess and set the content-type automatically, which is why this method
    // parameter is optional.
    if (optionalContentType)
      this.useHeader({ "Content-Type": optionalContentType });

    this.#body = body;
    return this;
  }

  /**
   * @param data Any data type that is of 'application/json' type and can be
   * stringified by `JSON.stringify`.
   *
   * ### About
   * Method that stringifies a JSON stringifiable data type to use as the
   * request body, and sets the content-type to 'application/json'.
   *
   * ### What data type can be passed in?
   * Any JS value that can be JSON serialized with `JSON.stringify()`. See the
   * link on what type of data can be used.
   * [MDN link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description)
   *
   * ### What if you have no data to send?
   * Even though there is no default arguement, you do not have to call this
   * method with an empty object when using a method like `POST` as `fetch` and
   * API services will just treat it as an empty object by default.
   *
   * ### Why not just use the `body` method?
   * Since JSON is the most popular methods of communication over HTTP, this
   * method helps users to write less code by stringifying their JS object and
   * setting content-type header to 'application/json', instead of requiring
   * library users to write `.body(JSON.stringify(data), "application/json")`
   * every single time they want to send JSON data to their API servers.
   * This also allows library users to specify type of data object using the
   * method generic for type checking.
   *
   * ### Using generics for TS Type Safety
   * ```typescript
   * const { res, err } = await sf
   *   .POST("/api")
   *   .bodyJSON<IReqBody>(val) // TS will enforce that val must be IReqBody
   *   .run();
   * ```
   * The above code sets the body type for type safety.
   *
   * For TS users, the data parameter is a generic type even though its default
   * type is `any` so that you can use it to restrict the type passed into the
   * method. This allows you to enforce type safety where once a generic type is
   * set, you know that the value passed in for the `body` parameter cannot be
   * any other type.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  bodyJSON<JsonRequestBodyType = JsonTypeAlias>(
    data: JsonRequestBodyType
  ): Fetch<unknown, unknown> {
    // Content-type needs to be set manually even though `fetch` is able to
    // guess most content-type, because once object is stringified, the data
    // will be a string and fetch will guess that it is 'text/plain' rather than
    // 'application/json'.
    return this.body(JSON.stringify(data), "application/json");
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
  async #fetch(): Promise<Response> | never {
    // This library assumes `fetch` exists in the global scope and does not
    // check for it, if it does not exists please load a `fetch` polyfill first!
    return fetch(this.#url, {
      /*
        Properties are set following the order of specificity:
        1. `RequestInit` options object is applied first
        2. HTTP method, which cannot be overwritten by `options`
        3. Instance specific headers, which cannot be overwritten by `options`
        4. Instance specific body data, which cannot be overwritten by `options`
        5. Instance specific timeout abortController's signal, which cannot be
           overwritten by `options`.

        From this order, we can see that the values in `options` object cannot
        override HTTP method set in the constructor, headers set with the
        `useHeader` method and `body` set by any of the body methods.
      */

      // Apply with spread, since final object is the same `RequestInit` type
      ...this.#options,

      method: this.#method,

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
      // on helper methods like `bodyJSON` to set body as JSON data type, and to
      // also set the content-type and do any transformations as needed.
      //
      // See #body prop's docs on its type
      body: this.#body,

      // Using optional chaining as `#abortController` may be undefined if not
      // library user did not set a custom timeout with `timeoutAfter` method,
      // if so, just let it be undefined and it will just be ignored.
      signal: this.#abortController?.signal,
    });
  }

  /**
   * ### About
   * This private method wraps the raw `#fetch` method to implement custom
   * timeout logic.
   *
   * ### Method 'safety'
   * This calls `#fetch` which might throw an exception when something goes
   * wrong, and this also throws an exception if the request timed out. So any
   * use of this method should be wrapped with the `safe` function.
   *
   * ### Return type
   * See documentation for `#fetch` method for more info on the return type.
   *
   * This method's Function type signature mirrors the Function type signature
   * of the `#fetch` method since this method is just a wrapper over it to
   * implement timeout, whatever that is returned from `#fetch` is directly
   * returned to this method's caller.
   */
  async #run(): Promise<Response> | never {
    // If no custom timeout specified, run `#fetch` and return directly.
    if (this.#abortController === undefined) return this.#fetch();

    // Create new timeout using the custom timeout milliseconds value, and save
    // the timeoutID so that the timer can be cleared to skip this callback if
    // the API returns before the timeout.
    const timeoutID = setTimeout(
      // On timeout, abort API call with a custom reason using the timeout value
      // specified by the library user.
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
      // `clearTimeout` will be skipped since the catch block re-throws any
      // exception it gets. That means that this abort method will still be
      // called even if the API call has already errored out. However this is
      // fine since calling abort after the API call completes will just be
      // ignored and will not throw a new error.
      () =>
        this.#abortController?.abort(
          `${this.#timeoutInMilliseconds}ms time out exceeded`
        ),

      this.#timeoutInMilliseconds
    );

    const res = await this.#fetch().catch((err) => {
      // If the exception is caused by the abort signal, throw new exception,
      // Else, re-throw original exception to let method caller handle it.
      if (
        err instanceof DOMException &&
        err.name === "AbortError" &&
        // This can be thought of as an almost redundant check, since the first
        // 2 conditions should already ensure that it is an `AbortError`. This
        // checks just makes sure that the AbortError is in fact caused by the
        // internal `#abortController` used for custom timeouts rather than a
        // abort controller that was somehow passed in via the options object.
        //
        // This also ensures `.signal.reason` is properly typed after narrowing
        // the abortController's type with this control flow conditional.
        this.#abortController?.signal.aborted
      )
        // Throw new exception with abort reason as message instead of the
        // generic 'DOMException'. If abort reason is somehow empty, default to
        // `err.message` to prevent throwing an empty exception.
        //
        // Use custom named class instead of the generic Error class so that
        // users can check failure cause with `instanceof` operator.
        throw new TimeoutException(
          this.#abortController.signal.reason ?? err.message
        );

      // If it is not an abort error, throw err to let it bubble up as it is.
      throw err;
    });

    // What if the fetch call errors out and this clearTimeout is not called?
    //
    // If `this.#fetch` method call throws an Error that is not caused by the
    // abort signal, e.g. an error caused by DNS failure, this `clearTimeout`
    // call will be skipped since the custom catch block re-throws any error
    // it gets. That means that the timeout callback will still call the abort
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
   * const { res, err } = await sf.useDefault().GET("/api").run();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be the Response object
   * ```
   */
  run() {
    // Need to wrap the call to the `this.#run` method in an anonymous arrow
    // function so that the `this` binding is preserved when running the method.
    return safe(() => this.#run());
  }

  /**
   * ### About
   * This private method wraps the `#run` method to parse the response, type
   * cast the data returned, validate the response if a validator is provided,
   * and before formatting the return value to satisfy `ApiResponse<T>`.
   *
   * ### Type Safety (for both Compile time and Run time)
   * The return type of this method is the generic type T, where the data will
   * be type casted as the generic type T. Although this makes using the library
   * really simple, this is not super type safe since the casting may be wrong.
   * Therefore this method allows you to pass in an optional validator acting as
   * a type predicate to do response validation, ensuring that the data is
   * actually of the correct type at **runtime**!
   * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
   *
   * These are all the possible workflows:
   * 1. No validator passed in
   *     - Data will be ***CASTED*** as type `T`
   * 2. Validator passed in, and validation passed
   *     - Data will be ***type narrowed*** as type `T`
   * 3. Validator passed in, validation failed
   *     - Returns an **Exception**
   *
   * ### Return type
   * Return type will always be `ApiResponse<T>` where T is the expected type of
   * the value after parsing the response with parsing methods on the Response
   * object like `Response.json()` or `Response.formData()`.
   *
   * If API service responds with a status code of 200-299 inclusive,
   * `ApiResponse<T>.ok` is automatically set to true, else it will be `false`.
   * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
   * https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
   *
   * ### What about redirects?
   * You do not have to worry about this method setting `ok` to false when the
   * HTTP response code is 300-399 even though it is outside of the 2XX range
   * because by default, fetch API's option will have redirect set to "follow",
   * which means it will follow the redirect to the final API end point and only
   * then is the `ok` value set with the final HTTP response code.
   */
  #runner<T>(
    responseParser: (res: Response) => Promise<T>,
    optionalResponseValidator?: Validator<T>
  ) {
    return safe(async () => {
      const res = await this.#run();

      // Assume data to be the generic type T without any validation so that
      // even if no validator is passed in by the library user, it can be
      // assumed that the data is correctly shaped as `T` during compile time.
      //
      // If not annotated with the type T, inference works for the most part,
      // but sometimes the type can end up as `Awaited<T>`. This only affects
      // the `runJSON` method where data is inferred as `Awaited<T>` instead of
      // `T`, which is technically the same type, but confuses library users.
      // This is probably caused by .json value extraction that returns `any` so
      // the conversion here does not properly take place.
      // Reference: https://github.com/microsoft/TypeScript/issues/47144
      const data: T = await responseParser(res);

      // Only run validation if a validator is passed in
      // User's validator can throw an exception, which will be safely bubbled
      // up to them if they want to receive a custom exception instead.
      if (
        optionalResponseValidator !== undefined &&
        !optionalResponseValidator(data)
      )
        // Use custom named class instead of the generic Error class so
        // that users can check failure cause with `instanceof` operator.
        throw new ValidationException("Validation Failed");

      return {
        ok: res.ok,
        status: res.status,
        headers: res.headers,
        data,
      } satisfies ApiResponse<T>;
    });
  }


  /**
   * Final builder method to call to start the Build process.
   */
  build() {
    const request = new Request(this.#url, {
      /*
        Properties are set following the order of specificity:
        1. `RequestInit` options object is applied first
        2. HTTP method, which cannot be overwritten by `options`
        3. Instance specific headers, which cannot be overwritten by `options`
        4. Instance specific body data, which cannot be overwritten by `options`
        5. Instance specific timeout abortController's signal, which cannot be
           overwritten by `options`.

        From this order, we can see that the values in `options` object cannot
        override HTTP method set in the constructor, headers set with the
        `useHeader` method and `body` set by any of the body methods.
      */

      // Apply with spread, since final object is the same `RequestInit` type
      ...this.#options,

      method: this.#method,

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
      // headers: (
      //   await Promise.all(
      //     this.#headers.map((header) =>
      //       typeof header === "function" ? header() : header
      //     )
      //   ).catch((err) => {
      //     // Wrap with HeaderException, see reasoning in `HeaderException` docs.
      //     throw new HeaderException(err);
      //   })
      // ).reduce((obj, item) => ({ ...obj, ...item }), {}),
      // @todo do this in `Fetch2`

      // Because fetch's body property accepts many different types, instead
      // of doing transformations like JSON.stringify here, this library relies
      // on helper methods like `bodyJSON` to set body as JSON data type, and to
      // also set the content-type and do any transformations as needed.
      //
      // See #body prop's docs on its type
      body: this.#body,

      // Using optional chaining as `#abortController` may be undefined if not
      // library user did not set a custom timeout with `timeoutAfter` method,
      // if so, just let it be undefined and it will just be ignored.
      signal: this.#abortController?.signal,
    });

    return new Fetch2<ErrorType, ResponseType>(
      request,

      this.#responseParser ?? ((res) => res.json()),

      // Just nice default here then the next Class dont have to default it and can set the generic properly
      this.#optionalErrorParser ?? ((res) => res.json()),

      this.#abortController,
      this.#timeoutInMilliseconds
    );
  }

  /**
   * Call API after configuring and get back response parsed as a **string**.
   *
   * This is `safe`, i.e. this method **will not throw** or let exceptions
   * bubble up so no try/catch wrapper block or .catch method is needed to
   * handle the jumping control flow of exceptions.
   *
   * @example Call API and handle any exception sequentially in the same scope
   * ```typescript
   * const { res, err } = await sf.useDefault().GET("/api").runText();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be be a string
   * ```
   */
  runText(optionalValidator?: Validator<string>) {
    return this.#runner((res) => res.text(), optionalValidator);
  }

  /**
   * Call API after configuring and get back response parsed as a **Blob**.
   *
   * This is `safe`, i.e. this method **will not throw** or let exceptions
   * bubble up so no try/catch wrapper block or .catch method is needed to
   * handle the jumping control flow of exceptions.
   *
   * @example Call API and handle any exception sequentially in the same scope
   * ```typescript
   * const { res, err } = await sf.useDefault().GET("/api").runBlob();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be a Blob
   * ```
   */
  runBlob(optionalValidator?: Validator<Blob>) {
    return this.#runner((res) => res.blob(), optionalValidator);
  }

  /**
   * Call API after configuring and get back response parsed as **FormData**.
   *
   * This is `safe`, i.e. this method **will not throw** or let exceptions
   * bubble up so no try/catch wrapper block or .catch method is needed to
   * handle the jumping control flow of exceptions.
   *
   * @example Call API and handle any exception sequentially in the same scope
   * ```typescript
   * const { res, err } = await sf.useDefault().GET("/api").runFormData();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be form data
   * ```
   */
  runFormData(optionalValidator?: Validator<FormData>) {
    return this.#runner((res) => res.formData(), optionalValidator);
  }

  /**
   * Call API after configuring and get back response parsed as **ArrayBuffer**.
   *
   * This is `safe`, i.e. this method **will not throw** or let exceptions
   * bubble up so no try/catch wrapper block or .catch method is needed to
   * handle the jumping control flow of exceptions.
   *
   * @example Call API and handle any exception sequentially in the same scope
   * ```typescript
   * const { res, err } = await sf.useDefault().GET("/api").runArrayBuffer();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be an Array Buffer
   * ```
   */
  runArrayBuffer(optionalValidator?: Validator<ArrayBuffer>) {
    return this.#runner((res) => res.arrayBuffer(), optionalValidator);
  }

  /**
   * Call API after configuring and get back response parsed as **JSON**.
   *
   * This is `safe`, i.e. this method **will not throw** or let exceptions
   * bubble up so no try/catch wrapper block or .catch method is needed to
   * handle the jumping control flow of exceptions.
   *
   * @example Call API and handle any exception sequentially in the same scope
   * ```typescript
   * const { res, err } = await sf.useDefault().GET("/api").runJSON<MyResponseObjectType>();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be 'MyResponseObjectType'
   * ```
   *
   * ### Using generics for TS Type Safety
   * This method accepts a generic type to type the returned object. Allowing
   * you to have type safety for the response object. However, this DOES NOT
   * perform any runtime response validation, so even if it is type safe, it
   * does not mean that the response object is guaranteed to be what you typed
   * it to be. For run time type safety, please pass in a validator (type
   * predicate) to do runtime response data validation, so that the library can
   * safely type narrow it down to the generic type T passed in.
   */
  runJSON<T = JsonResponse>(optionalValidator?: Validator<T>) {
    return this.#runner<T>((res) => res.json(), optionalValidator);
  }

  /**
   * Optional as it will parse the same way as original data type if undefined.
   */
  #optionalErrorParser?: ResponseParser<ErrorType>;

  /**
   * Use this to set a custom response parser when `Response.ok === false` if
   * the error data type is different from the Response data type.
   *
   * E.g. expected data type to be `string` but on error, API will return a
   * `JSON` object instead. Therefore you can use this to set a custom error
   * response parser for the specific error type.
   *
   * Defaults to use a `JSON` response parser since that is the most popular
   * error response data types.
   */
  parserErrorWith<ErrorResponseDataType extends ErrorType = ErrorType>(
    errorParser: ResponseParser<ErrorResponseDataType>
  ): Fetch<ResponseType, ErrorResponseDataType> {
    this.#optionalErrorParser = errorParser;
    return this as unknown as Fetch<ResponseType, ErrorResponseDataType>;
  }

  /**
   * Optional so that it can be defined outside of the constructor.
   */
  #responseParser?: ResponseParser<ResponseType>;

  parseAsJSON<T = any>(): Fetch<T, ErrorType> {
    this.#responseParser = (res) => res.json();
    return this as unknown as Fetch<T, ErrorType>;
  }
}
