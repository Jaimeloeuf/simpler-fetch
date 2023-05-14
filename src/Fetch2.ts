import type { Header, HTTPMethod } from "./types";
import { Final } from "./Final";

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
   *
   * ### Important
   * When passing in the default options and headers, make sure to pass in a new
   * object and array, as these will be passed in by reference, which means that
   * the original options object and header array will be mutated when `Fetch`
   * instance methods mutate the values on the instance itself.
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
   * @returns Returns the current instance to let you chain method calls
   */
  timeoutAfter(timeoutInMilliseconds: number): Fetch {
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
   * Utility method used to unify the creation of `Final` instance
   * to pass in all the config values
   */
  async #runner<T>(valueExtractor: (res: Response) => Promise<T>) {
    const request = new Request(this.#url, {
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

    return new Final(
      request,
      this.#timeoutInMilliseconds,
      this.#abortController,
      valueExtractor
    );
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
    return this.#runner((res) => Promise.resolve(res));
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
  runText() {
    return this.#runner((res) => res.text());
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
  runBlob() {
    return this.#runner((res) => res.blob());
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
  runFormData() {
    return this.#runner((res) => res.formData());
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
  runArrayBuffer() {
    return this.#runner((res) => res.arrayBuffer());
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
  runJSON() {
    return this.#runner((res) => res.json());
  }
}
