import type {
  Header,
  HTTPMethod,
  ApiResponse,
  Validator,
  JsonResponse,
} from "./types";
import { safe } from "./safe";

/**
 * Class used to create an Object Oriented `Fetch` abstraction
 *
 * This object oriented approach gives users a easy to use chainable interface to build their API calls
 */
export class Fetch {
  /* Private Instance variables that are only accessible internally */

  /**
   * Instance variable to set the HTTP method used for the API call.
   *
   * This can only be set in the constructor, and library users do not need to set this as
   * they can just use one of the static constructor wrapper methods.
   */
  readonly #method: HTTPMethod;

  /**
   * This is the path of the API endpoint to make the request.
   *
   * This can either be a relative or absolute URL path on the current or another domain.
   *
   * ### How to set this
   * 1. Making an API call to a relative URL endpoint on the same domain as the site
   *    - Leave baseUrl blank by not setting a baseUrl and use the relative path directly like `oof.GET(path)`
   *    - If baseUrl has already been set to another domain, then use the relative path directly with a call to the `once` method like `oof.GET(path).once()`
   * 1. Making an API call to a relative URL endpoint on a seperate API domain
   *    - Set the baseUrl using `oof.setBaseUrl(baseUrl)` and use the relative path directly like `oof.GET(path)`
   * 1. Making an API call to an absolute URL endpoint on a seperate API domain once
   *    - Use the full path directly like `oof.GET(fullUrlPath).once()`
   */
  readonly #url: string;

  /**
   * Instance variable to set the `RequestInit` type options passed to the `fetch` function.
   */
  readonly #opts: RequestInit;

  /**
   * An array of headers to be combined before being used in this instance's API call.
   *
   * This cannot be optional because in the `header` method, it assumes that `this.#headers`
   * is already an array and inside the `#fetch` method it also assumes that it is already
   * an array by default when calling the `map` method on this.
   *
   * Therefore this is not optional and has to be initialized through the constructor using
   * default options set on the `Builder` instance.
   */
  readonly #headers: Array<Header>;

  /**
   * The `body` field will be used for the `body` prop of the `fetch` function.
   * Since that function accepts the type of `BodyInit | null` and we can also
   * pass it strings that are stringified with JSON.stringify, `body` can be any
   * type as JSON.stringify accepts any type that is serializable.
   *
   * The JSON.stringify method takes many types of arguments as specified in the reference links below.
   * Due to the huge variety of argument types and the lack of a standard TypeScript interface/type
   * describing it, this is explicitly typed as `any`, which means that this type is basically anything
   * that can be serialized by JSON.stringify and also any child types of `BodyInit | null`
   *
   * References:
   * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
   * - https://tc39.es/ecma262/#sec-json.stringify
   */
  #body?: any;

  /**
   * Optional `AbortController` used for the custom timeout set by `timeoutAfter()`
   */
  #abortController?: AbortController;

  /**
   * Optional timeout milliseconds for the custom timeout set by `timeoutAfter()`
   */
  #timeoutInMilliseconds?: number;

  /**
   * Low level constructor API that should not be used directly by library users.
   * This is only used by the `Builder` class to construct a new instance after
   * using the builder pattern.
   */
  constructor(
    readonly method: HTTPMethod,
    url: string,
    defaultOpts: RequestInit,
    headers: Array<Header>
  ) {
    this.#method = method;
    this.#url = url;
    this.#opts = defaultOpts;
    this.#headers = headers;
  }

  /**
   * Method to set `RequestInit` object for this one API call.
   *
   * ### When to use this method?
   * Use this to set custom RequestInit parameters for this specific `oof` instance's
   * fetch method call. See below on when should you use this method.
   *
   * Note that the options set using this method cannot override the headers set with
   * the `headers` method, cannot override the HTTP `method` set in the constructor
   * and cannot override the body value set by any of the 'body' methods.
   *
   * Which is why:
   * - If you want to set request body, use the `.body` or `.bodyJSON` method instead.
   * - If you need to set a request header, use the `.header` method instead.
   * - If you want to set HTTP request method, use one of the static methods on `Builder`
   *
   * Do not use this unless you have a specific option to pass in e.g. cache: "no-cache"
   * for this one specific API call only and nothing else. If there are options that you
   * want to set for all API request calls, use `Builder`'s `.setDefaultOptions` method
   * instead. Note that any options value set using this method will also override the
   * default options set.
   *
   * This method merges the provided options with the previously set options, so if any
   * default options can be overwritten there. Note that this is a shallow merge and not
   * a deepmerge.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  options(opts: RequestInit): Fetch {
    // Using Object.assign to mutate the original object instead of creating a new one.
    // this.#opts = { ...this.#opts, ...opts };
    Object.assign(this.#opts, opts);
    return this;
  }

  /**
   * Add Header(s) to include in the API call.
   *
   * Accepts plain header objects, functions and async functions.
   *
   * Functions passed in will be called right before the API call to generate a header object,
   * to delay generating certain header values like a time limited auth token or recaptcha.
   *
   * This method can be called multiple times, and all the header objects will be combined.
   * If there are duplicate headers, the latter will be used.
   *
   * If you prefer, this method is also a variadic function that accepts multiple arguments
   * of the same type so that you can call this method just once if you have all the headers
   * instead of invoking this method multiple times.
   *
   * The `headers` function parameter forces the caller to pass in at least one argument
   * for this variadic method. See https://stackoverflow.com/a/72286990
   *
   * @returns Returns the current instance to let you chain method calls
   */
  header(...headers: [Header, ...Header[]]): Fetch {
    this.#headers.push(...headers);
    return this;
  }

  /**
   * Use this method to set a custom timeout, instead of relying on brower default
   * timeouts like Chrome's 300 seconds default.
   *
   * The timeout value is optional, and it uses a arbitrary 8 seconds default.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  timeoutAfter(timeoutInMilliseconds: number = 8000): Fetch {
    this.#timeoutInMilliseconds = timeoutInMilliseconds;
    this.#abortController = new AbortController();

    return this;
  }

  /* All methods for setting body starts with the word 'body' */

  /**
   * Set the request body to be sent to server for HTTP methods such as POST/PUT.
   *
   * ### When to use this method?
   * For most users who want to send JSON data to the server, see the `bodyJSON` method
   * instead of a simpler API. For other types of data like `FormData`, `Blob` and `streams`
   * can just pass it into this method as the `body` parameter and the content type will be
   * automatically detected / set by the `fetch` function.
   *
   * ### Why have both `body` and `bodyJSON` method?
   * The reason for this method instead of just having `bodyJSON` only is because the library
   * cannot always just assume that users only use JSON data, and have to support data types
   * like FormData, Blob and etc... However the problem is that when content-type cannot be
   * set fetch will try to guess it, but when body is the results of JSON.stringify(this.#body),
   * fetch will guess the content-type to be text/plain and the browser will treat it as a safe
   * CORS request, which means that for that request there will be no pre-flight request sent.
   * Which means that the browser prevents certain headers from being used, which might cause
   * an issue, and also the server may not always respond correctly because they assume they got
   * text/plain even though your API endpoint is for application/json.
   *
   * The type of `body` value can be anything, as you can pass in any value that the
   * `fetch` API's `RequestInit`'s body property accepts.
   *
   * ### Using generics for TS Type Safety
   * ```javascript
   * const { res, err } = await oof
   *   .POST("/api")
   *   .body<FormData>(someValue) // TS will enforce that someValue must be FormData
   *   .run();
   * ```
   * The above code sets the body type for type safety.
   *
   * For TS users, the body type is a generic type variable even though its default type
   * for it is `any` so that you can use it to restrict the type passed into the method.
   * This allows you to enforce type safety where once a generic type is set, you know that
   * the value passed in for the `body` parameter cannot be any other type.
   *
   * ### On `optionalContentType`'s type safety
   * Note on `optionalContentType`'s type: Although it is possible to create a union type
   * of all allowed string literals for the content-type header / mime types, it is not
   * very feasible as it is a very big list that will be updated in the future. Therefore
   * users are expected to make sure that any string they pass is valid.
   * References on all supported content-type values:
   * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
   * - https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header/48704300#48704300
   * - https://www.iana.org/assignments/media-types/media-types.xhtml
   *
   * @returns Returns the current instance to let you chain method calls
   */
  body<T = any>(body: T, optionalContentType?: string): Fetch {
    // Only add in the content-type header if user chooses to set it,
    //
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#body
    // Quoting the above link's last line: "... the fetch() function will try to
    // intelligently determine the content type. A request will also automatically
    // set a Content-Type header if none is set in the dictionary."
    //
    // This means that if none is passed in, fetch API's implementation will guess and
    // set the content-type automatically, which is why this method parameter is optional.
    if (optionalContentType)
      this.header({ "Content-Type": optionalContentType });

    this.#body = body;
    return this;
  }

  /**
   * @param data Any data type that is of 'application/json' type and can be stringified by JSON.stringify
   *
   * ### About
   * Method that stringifies a JSON stringifiable data type to use as the request body,
   * and sets the content-type to 'application/json'.
   *
   * ### What data type can be passed in?
   * The type of data that can be passed in, is any JS value that can be JSON serialized
   * with `JSON.stringify()`. See this [MDN link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description)
   * on what type of data can be passed in.
   *
   * ### What if you have no data to send?
   * Even though there is no default arguement, you do not have to call the `.data` method with an empty object when
   * calling a method like `oof.POST` as `fetch` and API services will just treat it as an empty object by default.
   *
   * ### Why does this method exists?
   * Because, the `#run` method needs to accept too many data input types,
   * so instead of doing all the processing and transforming then, the specific
   * transformations should be done in helper methods like this so that in the
   * actual `fetch` call, we can just set `body: this.#body` directly.
   *
   * ### Why not just use the `body` method?
   * Since JSON is one of the most popular methods of communication over HTTP,
   * this method helps users to write less code by helping them stringify their
   * JS object and set the content-type header to 'application/json', instead
   * of requiring them to explicitly call `.body(JSON.stringify(data), "application/json")`
   * every single time they want to send JSON data to their API servers.
   *
   * ### Using generics for TS Type Safety
   * ```javascript
   * const { res, err } = await oof
   *   .POST("/api")
   *   .bodyJSON<MyRequestBody>(val) // TS will enforce that val must be MyRequestBody
   *   .run();
   * ```
   * The above code sets the body type for type safety.
   *
   * For TS users, the data parameter have a generic type even though its default type
   * is `any` so that you can use it to restrict the type passed into the method.
   * This allows you to enforce type safety where once a generic type is set, you know that
   * the value passed in for the `body` parameter cannot be any other type.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  bodyJSON<T = any>(data: T): Fetch {
    // Content-type needs to be set manually even though `fetch` is able to guess most
    // content-type because once object is stringified, the data will be a string, and
    // fetch will guess that it is 'text/plain' rather than 'application/json'.
    return this.body(JSON.stringify(data), "application/json");
  }

  /**
   * ### About
   * This is private `#fetch` method is used to make the API call internally after constructing the
   * API call object and configuring all its values using object oriented method chaining with the
   * instance methods. This method should only be called by the `#run` wrapper method which implements
   * the timeout logic.
   *
   * This method is basically a wrapper around the fetch API where it takes all the options configured
   * using the public instance methods and stored in the instance variables and use these for fetch
   * API's RequestInit parameter, while taking care of certain things like creating the full API url
   * using any baseUrl set with `setBaseUrl`, delayed header generation and etc...
   *
   * ### Method 'safety'
   * This is the underlying raw fetch method that might throw an error when something goes wrong.
   *
   * ### More on the return type
   * The return type is unioned with `never` because this function can throw, aka never return.
   * However with TS, any value unioned with `never`, will be itself, because checking for control
   * flow is not enforced / not possible with TS. This is more for documentation purposes for
   * library writers and users who want to learn more about this API.
   */
  async #fetch(): Promise<Response> | never {
    // This library does not check if `fetch` is available in the global scope,
    // it assumes it exists, if it does not exists, please load a `fetch` polyfill first!
    return fetch(this.#url, {
      /*
        Properties are set following the order of specificity:
        1. `RequestInit` options is applied first
        2. HTTP method, which cannot be overwritten by options object
        3. Instance specific headers, which cannot be overwritten by options object
        4. Instance specific body data, which cannot be overwritten by options object
        5. Instance specific timeout abortController's signal, which cannot be overwritten by options object

        From this order, we can see that options cannot override method set by constructor, headers
        set by the `header` method and `body` set by any of the body methods.
      */

      // Apply options by spreading it, since the final object is of the same `RequestInit` type
      ...this.#opts,

      method: this.#method,

      // Run header functions if any to ensure array of headers is now an array of header objects,
      // The array of headers have the type of `object | Promise<object>` because header generator
      // functions can be async to let users delay generating headers until `run` time. Use case
      // include only generating a very short lived token at the last minute before the API call
      // is made to ensure that it does not expire by the time it reaches the API server.
      //
      // `await Promise.all` on the array of headers to ensure all are resolved to `object` type,
      // before reducing the array of header objects into a single header object.
      headers: (
        await Promise.all(
          this.#headers.map((header) =>
            typeof header === "function" ? header() : header
          )
        )
      ).reduce((obj, item) => ({ ...obj, ...item }), {}),

      // Because fetch's body prop can accept many different types of data, instead
      // of doing transformations like JSON.stringify here, this library relies
      // on helper methods like `bodyJSON` to set a JSON data type as the body
      // and to also set the content-type and do any transformations as needed.
      //
      // See #body prop's docs on its type
      body: this.#body,

      // Using optional chaining as `#abortController` may be undefined if not set using the `timeoutAfter`
      // method, if so, just let it be undefined and it will just be ignored.
      signal: this.#abortController?.signal,
    });
  }

  /**
   * ### About
   * This private method wraps the raw `#fetch` method to implement custom timeout logic.
   *
   * This is the underlying raw `#run` method used by all other 'safe' run methods, `run`, `runJSON`,
   * `runText`, `runBlob`, `runFormData`, `runArrayBuffer`.
   *
   * ### Method 'safety'
   * All other 'run' methods are safe by default, i.e. they do not throw on any errors/exceptions!
   * This is the only underlying raw method that might throw an error/exception when something goes
   * wrong. All the other methods are wrapped in the `safe` function to catch any errors so that it
   * can be returned instead of causing a jump in the code control flow to the nearest catch block.
   *
   * The safety feature is super useful as it reduces the amount of boiler plate code you have to
   * write (try/catch blocks and .catch methods) when dealing with libraries that can throw as it
   * will disrupt your own code's flow. This safe APIs enables you to write single block level code
   * that are guaranteed to not throw and gives you a super readable code control flow!
   *
   * ### More on the return type
   * This method's Function type signature mirrors the Function type signature of the `#fetch`
   * method since this method is just a wrapper over it to implement timeout, whatever that is
   * returned from `#fetch` is directly returned to this method's caller.
   *
   * See the documentation for `#fetch` method for more information on its return type.
   */
  async #run(): Promise<Response> | never {
    // If there is no custom timeout specified, just directly run and return the result of `#fetch`
    if (this.#abortController === undefined) return this.#fetch();

    // Create a new timeout using the custom timeout milliseconds value, and save the timeoutID so
    // that the timer can be cleared to skip the callback if the API returns before the timeout.
    const timeoutID = setTimeout(
      // On timeout, abort the API call with a custom reason with the caller specified timeout value.
      //
      // As TS notes, the `this.#abortController` variable could be changed and became  undefined/null
      // between the time that this setTimeout callback function is defined and when this is triggered.
      // Since there is no other code that will modify this variable, its value can be safely assumed
      // to not be deleted when this callback is called, which means that a non-null assertion operator
      // can be used. However just to be extra safe, an optional chaining operator is used instead, so
      // in the event where it is somehow undefined/null, this will not error out.
      //
      // If `this.#fetch` method call throws an Error that is not caused by this timeout, for e.g. an
      // error like DNS failed, the `clearTimeout` call will be skipped since the custom catch block
      // re-throws any error it gets. That means that this abort method will still be called even if
      // the API call has already errored out. However this is fine since calling abort after the API
      // call completes will just be ignored and will not cause any new errors to be thrown.
      () =>
        this.#abortController?.abort(
          `${this.#timeoutInMilliseconds}ms time out exceeded`
        ),

      this.#timeoutInMilliseconds
    );

    const res = await this.#fetch().catch((err) => {
      // If the error is caused by the abort signal, throw a new custom error,
      // Else, re-throw original error to let method caller handle it.
      if (
        err instanceof DOMException &&
        err.name === "AbortError" &&
        // This can be thought of as an almost redundant check, since the first 2 conditions
        // should already ensure that it is an `AbortError`. This checks just makes sure that
        // the AbortError is in fact caused by the internal `#abortController` used for custom
        // timeouts rather than a abort controller passed in via options.
        //
        // This also ensures that `.signal.reason` access is properly typed after narrowing the
        // optional abortController's type in this control flow conditional.
        this.#abortController?.signal.aborted
      )
        // Throw new error with abort reason as message instead of the generic 'DOMException'
        // If reason is somehow empty, default to err.message to prevent throwing an empty error.
        throw new Error(this.#abortController.signal.reason ?? err.message);

      // Throw err to continue if not an abort error as we dont have to override the message
      throw err;
    });

    // What if the fetch call errors out and this clearTimeout is not called?
    //
    // If `this.#fetch` method call throws an Error that is not caused by the abort signal, e.g. an
    // error like DNS failed, this `clearTimeout` call will be skipped since the custom catch block
    // re-throws any error it gets. That means that the timeout callback will still call the abort
    // method even if the API call has already errored out. However that is fine since calling abort
    // after the API call completes will just be ignored and will not cause any new errors.
    clearTimeout(timeoutID);

    // Let response from `#fetch` pass through once timeout wrapper logic completed.
    return res;
  }

  /**
   * # Warning
   * This method is generally not used since this returns the raw HTTP Response object.
   * Library users should use the other run methods that handle value extraction too,
   * such as `runJSON`, `runFormData` and etc... This method is made available as an
   * escape hatch for users who do not want value extraction done, so that they can build
   * extra logic on top of this library by getting the raw Response object back.
   *
   * Safe version of the `#run` method that **will not throw** or let any errors bubble up,
   * i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.useDefault().GET("/api").run();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be the Response object
   * ```
   */
  run() {
    // Need to wrap the call to the `this.#run` method in an anonymous arrow function,
    // so that the `this` binding is preserved when running the method.
    return safe(() => this.#run());

    // Alternatives:
    //
    // `return safe(this.#run);`
    // If written like the way above, then it will fail, as there is no more `this`
    // binding when the call to that method is made within the `safe` function.
    //
    // `return safe(this.#run.bind(this));`
    // Above is an alternative that also works, but what they are trying to achieve is
    // essentially the same, which is to preserve the current `this` binding in this
    // run method, regardless of whether it is creating a new anonymous arrow function
    // or binding the current this to create a new function using `this.#run`. The
    // anonymous arrow function is used instead as it uses less characters.
  }

  /**
   * `#runner` method used to reduce duplicated logic of running the API call.
   *
   * ### About
   * This internal method calls the run method, calls the provided value extractor and
   * runs the validator type predicate if provided, before formatting the return value
   * to satisfy the expected `ApiResponse<T>` type.
   *
   * ### Type Safety (for both Compile time and Run time)
   * The return type of this method is the generic type T, where the data will be casted as type T.
   * Although this makes using the library really simple, this is not super type safe since the casting
   * may be wrong. Therefore this method allows you to pass in an optional validator acting as a type
   * predicate to do response validation, ensuring that the data is actually of the correct type.
   * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
   *
   * These are all the possible workflows:
   * 1. No validator passed in
   *     - Data will be ***CASTED*** as type `T`
   * 2. Validator passed in, and validation passed
   *     - Data will be ***type narrowed*** as type `T`
   * 3. Validator passed in, validation failed
   *     - Returns an **Error**
   *
   * ### Return type
   * Return type will always be `ApiResponse<T>` where T is the type of the extracted value using methods
   * such as `text`, `formData`, `json` and etc...
   *
   * When API service responds with a status code of between 200-299 inclusive, `ApiResponse<T>.ok` is
   * automatically set to `true`, else it will be set to `false`.
   * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
   * https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
   *
   * ### What about redirects?
   * You do not have to worry about this method setting `ok` to false when the HTTP response code is 300-399
   * even though it is outside of the 2XX range because by default, fetch API's option will have redirect
   * set to "follow", which means it will follow the redirect to the final API end point and only then is
   * the `ok` value set with the final HTTP response code.
   *
   */
  #runner<T>(
    valueExtractor: (res: Response) => Promise<T>,
    optionalValidator?: Validator<T>
  ) {
    return safe(async () => {
      const res = await this.#run();

      // Assume data to be T without any validation, so that if no validator passed in,
      // it can be assumed that the data is correctly shaped as `T` during compile time.
      //
      // If not annotated with the type T, inference works for the most part, but sometimes
      // the type can end up as `Awaited<T>`. This only affects the `runJSON` method where
      // data is inferred as `Awaited<T>` instead of `T`, which is technically the same type,
      // but confuses lib users, where it is probably caused by .json value extraction that
      // returns `any` so the conversion here does not properly take place.
      // Reference: https://github.com/microsoft/TypeScript/issues/47144
      const data: T = await valueExtractor(res);

      // Only run validation if a validator is passed in
      // User's validator can throw an error, which will be safely bubbled up to them,
      // if they want to receive a custom error instead of the generic `Error("Validation Failed")`
      if (optionalValidator !== undefined && !optionalValidator(data))
        throw new Error("Validation Failed");

      return {
        ok: res.ok,
        status: res.status,
        headers: res.headers,
        data,
      } satisfies ApiResponse<T>;
    });
  }

  /**
   * Abstraction on top of the `#run` method to return response body parsed as text.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.useDefault().GET("/api").runText();
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
   * Abstraction on top of the `#run` method to return response body parsed as Blob.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.useDefault().GET("/api").runBlob();
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
   * Abstraction on top of the `#run` method to return response body parsed as FormData.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.useDefault().GET("/api").runFormData();
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
   * Abstraction on top of the `#run` method to return response body parsed as ArrayBuffer.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.useDefault().GET("/api").runArrayBuffer();
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
   * Abstraction on top of the `#run` method to return response body parsed as JSON.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.useDefault().GET("/api").runJSON<MyResponseObjectType>();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be 'MyResponseObjectType'
   * ```
   *
   * ### Using generics for TS Type Safety
   * For TS users, this method accepts a generic type to type the returned object. Allowing you to have type
   * safety for the response object. However, this DOES NOT perform any runtime data validation, so even if
   * it is type safe, it does not mean that the response object is guaranteed to be what you typed it to be.
   *
   * For run time type safety, please pass in a type predicate validator to do response data validation before
   * type narrowing it down to the generic type T passed in.
   */
  runJSON<T = JsonResponse>(optionalValidator?: Validator<T>) {
    return this.#runner<T>((res) => res.json(), optionalValidator);
  }
}
