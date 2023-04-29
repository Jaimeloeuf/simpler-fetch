/**
 * `HeaderValue` type represents what can be used to add HTTP header values. This
 * type follows the `headers` type required by the fetch API itself.
 *
 * Note that this is NOT A JSON stringifiable type, since headers for the fetch API
 * do not accept arbitrary objects.
 *
 * Exporting this type so that you can explicitly type your Header objects
 * with this to ensure that it is correctly typed at point of value definition
 * instead of only type checking when you call the `.header` method.
 *
 * Note that although traditionally primitive values like numbers and boolean were
 * allowed, it is only because they were implicitly converted to strings before they
 * were sent out, as the HTTP spec requires header values to be strings. Thus this
 * stricter type makes it more obvious and enforces it at the user level
 *
 * https://stackoverflow.com/questions/34152142/possible-types-of-a-http-header-value
 */
export type HeaderValue = Exclude<HeadersInit, Headers>;

/**
 * ## `Header` Type
 * Header can either be,
 * 1. A `HeaderValue`
 * 2. A function that returns a `HeaderValue` or undefined
 * 3. A function that returns a Promise that resolves to a `HeaderValue` or undefined
 *
 * Header cannot be `undefined` directly because the `header` method cannot be directly called
 * with `undefined` because that wouldn't make any sense.
 *
 * Exporting this type so that you can explicitly type your Header values
 * with this to ensure that it is correctly typed at point of value definition
 * instead of only type checking when you call the `.header` method.
 *
 * ## `Header` function types
 * The function types can return undefined instead of a `HeaderValue` because the API call should
 * still run even if the header cannot be generated. For e.g. if using a function that reads auth
 * token from local storage and only return a `HeaderValue` with the token if it exists. This will
 * not cause any errors because spreading `undefined` into an object will just do nothing
 * `{ something: true, ...undefined }` will just be `{ something: true }`
 *
 * If function throws, the API call will be cancelled and the error will be caught by the 'safe'
 * functions i.e. the 'run' methods to be returned to users.
 *
 * ## Function return types
 * the return type can be undefined since spreading it like ...undefined will just do nothing
 * this is because if my header generation function say to get a JWT if it gets nothing, it can just
 * dont return, and let it be undefined
 */
export type Header =
  | HeaderValue
  | (() => HeaderValue | undefined)
  | (() => Promise<HeaderValue | undefined>);

/**
 * All the supported HTTP methods.
 * Ref: https://fetch.spec.whatwg.org/#methods
 *
 * Based on the reference link, although there are other HTTP methods, they are not
 * supported by the `fetch` spec, and therefore not included in this union type as
 * even if you could pass it to the `fetch` function, it will just fail.
 *
 * `HEAD` and `OPTIONS` HTTP methods are quite special and low level and extremely
 * rarely used, therefore these are the only 2 methods which do not have static
 * constructor wrapper methods to easily create `oof` instances for these methods.
 * Because of that, the only times where a library user will use the constructor
 * directly is when they want to use one of these 2 HTTP methods.
 *
 * Exporting this type so that you can explicitly type your HTTP method strings
 * as needed to ensure that they are correctly typed at point of value definition
 * instead of only type checking when you call the constructor.
 */
export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  // For the methods below, see JSDoc
  | "HEAD"
  | "OPTIONS";

/**
 * JsonResponse type is used as the base type for what can be returned from the server when using `runJSON()`.
 *
 * Note that this type is not a JSON type as this only support `{}` based types and all the other JSON string forms are not supported such as arrays or single strings.
 *
 * The reason why the other types are not supported is because the runJSON method actually injects the values of `ok` and `status` into the response before returning it.
 *
 * Exporting this type so that you can explicitly type your body objects
 * with this to ensure that it is correctly typed at point of value definition
 * instead of only type checking when you call the `.runJSON` method.
 *
 */
export type JsonResponse = Record<string | number | symbol, any>;

/**
 * Unifying all possible errors that can be thrown by fetch into
 * a single error type, covering possible errors thrown by header
 * function(s) too with the generic `Error` class.
 *
 * See this reference on all errors that can be thrown:
 * https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
 *
 * RequestError is exported from the library so that users can inspect this union type.
 */
export type RequestError =
  // AbortError
  | DOMException
  // If the network fails
  | TypeError
  // Generic Error type for when the header function throws....?
  | Error;

/**
 * @param fn Takes in any function to wrap around to prevent errors from bubbling up
 * @returns Returns either the result of the function call or an error if any is thrown, encapsulating both in an object that can be destructured
 *
 * ### About
 * Function wrapper to ensure that any of the `run` methods will not throw/bubble up any errors to the users,
 * instead all values and errors will be encapsulated into a monadic like structure for user to destructure out.
 * This takes inspiration from how Go-lang does error handling, where they can deal with errors sequentially,
 * without having to deal with jumping control flows with try/catch blocks.
 *
 * Go-lang error handling reference: https://go.dev/blog/error-handling-and-go
 *
 * This function gives 'run' methods a stricter type signature so that it will be more ergonomic for users when
 * using this library with TypeScript, as the new type signature will help with type narrowing operations, as
 * narrowing the type of one of the return value also narrows the other value's type. I.e. narrowing the 'err'
 * type to undefined will also narrow the 'res' type to be not undefined, effectively only requiring the users
 * to do type narrowing once rather than twice.
 *
 * This function's return type is generically typed using the return type of the `fn` parameter.
 *
 * The return type is manually/explicitly typed which is different from the TS inferred type signature, because
 * if `err: undefined` and `res: undefined` are not explicitly written in the return objects of the 2 methods,
 * TS will infer the return type to be a union of the types `{ res }` and `{ err }`. This is different from the
 * explicit type signature given, which says that every return object value will have both properties `{ res, err }`
 * defined even if one of the values is `undefined`. The problem with the inferred return type is that TS library
 * users cannot write code that allows them to destructure both values out first before using them like `const { res,
 * err } = await oof.GET("/api").run()`, which is kind of the main style that this library encourages users to use
 * because TS will complain that the user is trying to destructure a property that does not exist on the object. Even
 * though the value does not exist as what TS suggests, accessing an unknown property on an object produces the value
 * `undefined` anyways.
 *
 *
 * ### Why is `@ts-ignore` used?
 * Although this type signature provides strong type safety, to implement this type signature properly would mean
 * that the code (and by extension the build output) will be longer because the function would need to hardcode
 * the props that are undefined. This is unnecessary because in JS, any prop that isn't defined on an object will
 * have 'undefined' as its value when you try to access it by destructuring it out. Therefore the `ts-ignore` flag
 * is used to ignore the error of missing 'undefined' props to reduce library size while not affecting its usage.
 *
 * Implementation without using the `ts-ignore` flag
 * ```typescript
 * const safe = <T>(
 *   fn: () => Promise<T>
 * ): Promise<{ res: T; err: undefined } | { res: undefined; err: Error }> =>
 *    fn()
 *      .then((res) => ({ res, err: undefined })) // Hardcoded undefined required
 *      .catch((err) => ({ err, res: undefined })); // Hardcoded undefined required
 * ```
 *
 *
 * ### Why can't the return type be inferred?
 * ```typescript
 * const safe = async <T>(fn: () => Promise<T>) =>
 *   fn()
 *     .then((res) => ({ res }))
 *     .catch((err) => ({ err }));
 * ```
 * Why can't the code be written like this and let TS infer the return type?
 *
 * Because the inferred type will be a union type of `{res} | {err}`, which means that if the user attempts to write
 * `{ res, err }` to destructure out the values, it will result in an error, because TS thinks that the return type
 * will either be `{res}` or `{err}` only without letting the other counterpart be destructured to undefined unless
 * explicitly annotated.
 *
 *
 * ### Why not use an opaque type?
 * ```typescript
 * type Success<T> = { res: T; err: undefined };
 * type Failed = { res: undefined; err: Error };
 * type WrappedResponse<T> = Success<T> | Failed;
 *
 * const safe = <T>(fn: () => Promise<T>): Promise<WrappedResponse<T>> =>
 *   fn()
 *     .then((res) => ({ res, err: undefined }))
 *     .catch((err) => ({ err, res: undefined }));
 * ```
 * Why can't the code be written like this to use an opaque type for the return type so that it reads off nicely
 * rather than explicitly defining the return type in the function's type signature?
 *
 * Because Opaque types, although better worded and more descriptive to read, is opaque by nature (cannot see the
 * actual type notation) which means that it is harder for users to actually read and understand with one glance
 * what the return type actually is. They would have to look up the definition of the `WrappedResponse` type before
 * they can fully understand how to use it. Therefore to ensure that library users have as little context switch as
 * possible, the type definition is written in the function signature directly.
 */
const safe = <T>(
  fn: () => Promise<T>
): Promise<
  { res: T; err: undefined } | { res: undefined; err: RequestError }
> =>
  // @ts-ignore See the JSDoc on why this is used
  fn()
    .then((res) => ({ res }))
    .catch((err) => ({ err }));

/**
 * oof: Object Oriented `Fetch` abstraction
 *
 * This object oriented approach gives users a easy to use chainable interface to build their API calls
 */
export class oof {
  /**
   * This is the base URL used for all API calls that specify a relative API URL.
   *
   * This must be initialized with empty string, so that if the user does not set
   * a baseUrl using the `oof.setBaseURL` static method, `_run` method's implementation
   * of `oof.#baseUrl + this.path` will not result in `undefined + this.path` which
   * will give a invalid API URL.
   *
   * Read the value of this variable using the static method `oof.baseUrl`
   *
   * This is a static private variable to prevent users from setting it any other way
   * than using the `oof.setBaseURL` static method, so that users can easily find all
   * places that sets the baseUrl with a simple global search and find.
   */
  static #baseUrl = "";

  /** Static function to read the value of the base URL */
  static baseUrl = (): string => oof.#baseUrl;

  /**
   * Set base url and get back `oof` to chain this method call.
   *
   * Although any static methods can be chained with this method, usually the only thing that
   * you should chain to this method call is the `defaultOptions` method because these 2 methods
   * are usually all that every users need to use in order to setup a base configuration for all
   * future API calls made with this library.
   *
   * And the good thing about chaining with `defaultOptions` static method is that it does not
   * return the `oof` class which means you cannot chain anymore methods to it, and this is good
   * because your initial library configuration call should only consist of setting the `baseUrl`
   * and the default `RequestInit` options.
   */
  static setBaseURL(url: string): typeof oof {
    oof.#baseUrl = url;
    return oof;
  }

  /**
   * Default options that will be applied to all API calls, which can be set
   * using the `defaultOptions` static method. These options can be overwritten
   * one-off in specific API calls using the `options` method.
   *
   * Useful for doing things like setting the 'mode' of the request, e.g., cors,
   * no-cors, or same-origin. Use the link to see all the default options that
   * you can set like mode/credentials/cache/redirect:
   * https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
   *
   * This is a static private variable that is only accessible from within this
   * class's static method.
   *
   * ## Type
   * This is not typed as `RequestInit` as it will mess up the types in `#fetch`
   * method, which is why this is purposely widened to `any`. This can still be
   * type safe, since this value can only be set through the `defaultOptions`
   * static method, whose param is typed as `RequestInit`. In short, this is type
   * safe as this can only be set via the type safe `defaultOptions` method.
   */
  static #defaultOpts: any;

  /**
   * Static method to set default options that will be applied to all API calls.
   * The options set here can be overwritten one-off in specific API calls using
   * the `options` method.
   *
   * Note that everytime this static method is called, all the default options
   * are overwritten to use this, the default options will not be merged.
   *
   * This static method does not return the `oof` class to specifically be
   * unchainable, so that users do not mistakenly use this in an API call,
   * and it will be more explicit when they set default options.
   */
  static defaultOptions(opts: RequestInit): void {
    oof.#defaultOpts = opts;
  }

  /* Private Instance variables that are only accessible internally */

  /**
   * Instance variable to set the HTTP method used for the API call.
   *
   * This can only be set in the constructor, and library users do not need to set this as
   * they can just use one of the static constructor wrapper methods.
   */
  #method: HTTPMethod;

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
  #path: string;

  /**
   * Instance variable to set the `RequestInit` type options passed to the `fetch` function.
   *
   * This is optional following how `fetch` defines its `init` parameter to be optional.
   */
  #opts?: RequestInit;

  /**
   * An array of headers to be combined before being used in this instance's API call.
   *
   * This cannot be optional because in the `header` method, it assumes that `this.#headers`
   * is already an array and inside the `_run` method it also assumes that it is already an
   * array by default when calling the `map` method on this.
   *
   * Therefore this is not optional and has to be initialized here even though by right the
   * `fetch` function can accept it as `undefined`.
   */
  #headers: Array<Header> = [];

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
   * This flag on `oof` instances tells the `_run` method if it should treat the URL path
   * as a full path rather than a subpath to be concatenated to the `#baseUrl`, instead of
   * relying on heuristics in the `run` method to detect if the URL is a full path or not.
   *
   * This is used in conjunction with the `once` method to make a once off API call to
   * another domain/baseUrl without changing the `baseUrl` for all other API calls.
   *
   * This is optional so that it does not have to be initialized for every instance and
   * only set to true if required.
   */
  #once?: boolean;

  /**
   * Low level constructor API that generally isnt used.
   *
   * ### When should you use the constructor directly?
   * For most library users, just stick with the provided static methods for a cleaner API.
   *
   * The only times where a library user should use the constructor directly is when they
   * want to use either the `HEAD` or `OPTIONS` HTTP method because they are quite special
   * and low level and extremely rarely used, therefore these are the only 2 methods which
   * do not have static constructor wrapper methods to easily create `oof` instances.
   *
   * ### Parameters
   * The 2 parameters, `method` and `string`, are the only parameters that truly needs to be
   * defined for every single API call and cannot be optional. All other configuration options
   * can be set using instance methods like `options` and `headers` without relying on the
   * constructor to set all of them.
   *
   * ### Compared to v7 and earlier
   * In previous versions of this library, the constructor supported initializing all the
   * options used in the `fetch` function. Although more flexible, it did not make sense
   * because if someone were to use the constructor directly and pass in all the options,
   * then they might as well just use `fetch` directly as that is easier to use when passing
   * in all the config options at once. The whole purpose of this library is to configure
   * the API call parameters using a chainable interface before making that API call, so
   * there is no point in using a constructor that can initialize all of those values.
   * Therefore, in version 8, the constructor API is simplified to remove all the unnecessary
   * parameters to ensure users use this in the way it is designed. This new API also have
   * some added benefits of being smaller in size for the constructor code AND also simplifies
   * the caller code, while making it faster by removing the need to destructure out values,
   * and by skipping the check to possibly transform the headers parameter.
   *
   * ### v7 of the constructor
   * ```typescript
   * constructor({
   *     method,
   *     path,
   *     opts = {},
   *     headers = [],
   *   }: {
   *     method: HTTPMethod;
   *     path: string;
   *     opts?: RequestInit;
   *     headers?: Header | Array<Header>;
   *   }) {
   *     this.#method = method;
   *     this.#path = path;
   *     this.#opts = opts;
   *
   *     // Ensures that this.#headers is always an array regardless of what the user passes in
   *     // Users can pass in a single header object/function or an array of header objects/functions
   *     // If an array is passed in, leave it as it is, else wrap the single header object/function in a array
   *     this.#headers = Array.isArray(headers) ? headers : [headers];
   *   }
   * ```
   */
  constructor(method: HTTPMethod, path: string) {
    this.#method = method;
    this.#path = path;
  }

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `GET` API call
   *
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static GET = (path: string): oof => new oof("GET", path);

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `POST` API call
   *
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static POST = (path: string): oof => new oof("POST", path);

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `PUT` API call
   *
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static PUT = (path: string): oof => new oof("PUT", path);

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `PATCH` API call
   *
   * See this link on the difference between POST, PUT and PATCH HTTP methods:
   * https://en.wikipedia.org/wiki/PATCH_(HTTP)#:~:text=The%20main%20difference%20between%20the,instructions%20to%20modify%20the%20resource.
   *
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static PATCH = (path: string): oof => new oof("PATCH", path);

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `DEL` API call
   *
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static DEL = (path: string): oof => new oof("DELETE", path);

  /**
   * Call this method to make a once off API call, that is, to make the API call without
   * using the `baseUrl` of this class. Use this when you need to make an API call to
   * another domain/baseUrl without changing the `baseUrl` for all other API calls.
   *
   * This method sets the `#once` flag on this `oof` instance so that `_run` will treat
   * the URL request path as a full path rather than a subpath to be concatenated to the
   * `#baseUrl`. The flag setting way is used instead of relying on heuristics in the
   * `run` method to detect if the URL is a full path or not.
   *
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  once(): oof {
    this.#once = true;
    return this;
  }

  /**
   * @param {RequestInit} opts RequestInit object for this one API call
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
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
   * - If you want to set HTTP request method, use one of the static constructors
   * like `oof.GET("/api/path")` or use the constructor by passing in a non-default
   * (not GET/POST/PUT/DEL) HTTP method instead like `new oof({ method:"HTTP-METHOD" })`
   *
   * Do not use this unless you have a specific option to pass in e.g. cache: "no-cache"
   * for this one specific API call only and nothing else. If there are options that you
   * want to set for all API request calls, use the `oof.defaultOptions` static method
   * instead. Note that any options value set using this method will also override the
   * default options set using `oof.defaultOptions`.
   *
   * This method directly assigns the arguement to `this.#opts` which means calling this
   * method overrides whatever options that is already set previously. Because it does
   * not make sense for the user to call this repeatedly since there is no default options
   * set by this library anyways. Thus it is a direct assignment instead of a merge like
   * `this.#opts = { ...this.#opts, ...opts }`
   */
  options(opts: RequestInit): oof {
    this.#opts = opts;
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
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  header(...headers: [Header, ...Header[]]): oof {
    this.#headers.push(...headers);
    return this;
  }

  /**
   * Use this method to set a custom timeout, instead of relying on brower default
   * timeouts like Chrome's 300 seconds default.
   *
   * The timeout value is optional, and it uses a arbitrary 8 seconds default.
   */
  timeoutAfter(timeoutInMilliseconds: number = 8000): oof {
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
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  body<T = any>(body: T, optionalContentType?: string): oof {
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
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
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
   * Because, the `_run` method needs to accept too many data input types,
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
   */
  bodyJSON<T = any>(data: T): oof {
    // Content-type needs to be set manually even though `fetch` is able to guess most
    // content-type because once object is stringified, the data will be a string, and
    // fetch will guess that it is 'text/plain' rather than 'application/json'.
    return this.body(JSON.stringify(data), "application/json");

    // Alternative that implements setting body directly instead of using
    // the lower level method, but would result in a larger library size.
    // this.header({ "Content-Type": "application/json" });
    // this.#body = JSON.stringify(data);
    // return this;
  }

  /**
   * ### About
   * This is private `#fetch` method is used to make the API call internally after constructing the
   * API call object and configuring all its values using object oriented method chaining with the
   * instance methods. This method should only be called by the `_run` wrapper method which implements
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
    return fetch(
      // Use the flag on this `oof` instance to see if the URL path should be treated as a full path rather
      // than a subpath to be concatenated to the `#baseUrl`, instead of relying on heuristics to detect if
      // the URL is a full path or not, which was how it was done in v7 and before. The new method now is
      // more reliable, as the library user can use the `once` method to explicitly set if they want to make
      // a one off API call with the path as the full URL path rather than hoping for the heuristics to work.
      // This also solves a long standing issue where users who wanted to use a full URL with a none HTTP
      // based scheme like 'blob://xyz.com' could not work as the heuristics only checks for HTTP based schemes.
      // The new method is also faster as a simple conditional expression is faster than running a regex match.
      //
      // How it was done in v7 and before:
      // Checks if `this.#path` contains any http protocol identifier using a case-insensitive regex match
      // If found, assume user passed in full URL to skip using base URL, thus use `this.#path` directly as
      // full URL, else prepend base URL to `this.#path` to get the full URL.
      // ```typescript
      // this.#path.match(/https:\/\/|http:\/\//i)
      //   ? this.#path
      //   : oof.#baseUrl + this.#path,
      // ```
      this.#once ? this.#path : oof.#baseUrl + this.#path,
      {
        /*
          Properties are set following the order of specificity:
          1. `defaultOptions` is the most generic so it is be applied first
          2. instance specific options is applied right after so it can override default options as needed
          3. the HTTP method, which cannot be overwritten by either default or instance options
          4. the instance specific headers, which cannot be overwritten by either default or instance options
          5. the instance specific body data, which cannot be overwritten by either default or instance options
          6. the instance specific timeout abortController's signal, which cannot be overwritten by options

          From this order, we can see that options cannot override method set by constructor, headers
          set by the `header` method and `body` set by any of the body methods.
       */

        // Apply the base / default options first so that other more specific values can override this.
        ...oof.#defaultOpts,

        // Apply instance specific options if any, and it will override any defaults it clashes with.
        // Note that the options merging with the default options is a shallow merge and not a deepmerge.
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
      }
    );
  }

  /**
   * ### About
   * This method wraps the raw `#fetch` method to implement custom timeout logic, and this should
   * not be used by users directly.
   *
   * This is the underlying raw `_run` method used by all other 'safe' run methods, `run`, `runJSON`,
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
  async _run(): Promise<Response> | never {
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
        this.#abortController?.signal.aborted
      )
        // Throw new error with abort reason as message instead of the generic 'DOMException'
        throw new Error(this.#abortController?.signal.reason);

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

  /*
    All methods for executing an API call starts with the word 'run'

    Below are safe 'run' methods that will not throw / let any async errors bubble up.
    These methods are wrapped with the `safe` function and `return { res, err }` to force
    users to explicitly handle it with type narrowing instead of letting caller handle
    any errors/exceptions thrown by the run methods, making it more type safe and explicit.

    All the method calls are wrapped in anonymous functions passed to the safe function to
    execute to reuse the error catching code block to save on library size.
  */

  /**
   * Safe version of the `_run` method that **will not throw** or let any errors bubble up,
   * i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").run();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be the Response object
   * ```
   */
  run() {
    // Need to wrap the call to the `this._run` method in an anonymous arrow function,
    // so that the this binding is preserved when running the method.
    return safe(() => this._run());

    // Alternatives:
    //
    // `return safe(this._run);`
    // If written like the way above, then it will fail, as there is no more `this`
    // binding when the call to that method is made within the `safe` function.
    //
    // `return safe(this._run.bind(this));`
    // Above is an alternative that also works, but what they are trying to achieve is
    // essentially the same, which is to preserve the current `this` binding in this
    // run method, regardless of whether it is creating a new anonymous arrow function
    // or binding the current this to create a new function using `this._run`. The
    // anonymous arrow function is used instead as it uses less characters.
  }

  /*
    These are other methods that builts on the `_run` method to simplify value extraction.
    These functions can be async as it returns a Promise, but it is not necessary as no await is used within.
  */

  // Attempt to simplify 'run' methods by reducing the number of calls to `this._run()`
  // so for e.g. `runText` can be defined as `runText() { return this.runner("text") }`
  // Not used right now as it is less type safe when developing the library, and also
  // because this adds an extra function call overhead.
  // runner(method: string) {
  //   return this._run().then((res) => res[method]());
  // }

  /**
   * Abstraction on top of the `_run` method to return response body parsed as text.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").runText();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be be a string
   * ```
   */
  runText() {
    return safe(() => this._run().then((res) => res.text()));
  }

  /**
   * Abstraction on top of the `_run` method to return response body parsed as Blob.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").runBlob();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be a Blob
   * ```
   */
  runBlob() {
    return safe(() => this._run().then((res) => res.blob()));
  }

  /**
   * Abstraction on top of the `_run` method to return response body parsed as FormData.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").runFormData();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be form data
   * ```
   */
  runFormData() {
    return safe(() => this._run().then((res) => res.formData()));
  }

  /**
   * Abstraction on top of the `_run` method to return response body parsed as ArrayBuffer.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").runArrayBuffer();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be an Array Buffer
   * ```
   */
  runArrayBuffer() {
    return safe(() => this._run().then((res) => res.arrayBuffer()));
  }

  /**
   * Abstraction on top of the `_run` method to return response body parsed as JSON.
   *
   * This method is 'safe' in the sense that this **will not throw** or let any errors bubble
   * up, i.e. no try/catch or .catch method needed to handle the jumping control flow of errors.
   *
   * @example <caption>Call API and handle any errors sequentially at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").runJSON<MyResponseObjectType>();
   *
   * if (err) return console.log("API Call failed!");
   *
   * console.log("Res:", res); // Type narrowed to be 'MyResponseObjectType'
   * ```
   *
   * ### Why are values injected in the return type?
   * Return type will always union with { ok: boolean; status: number; } as these will always be injected in.
   *
   * When API server responds with a status code of anything outside of 200-299 Response.ok is auto set to false
   * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
   * https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
   *
   * Thus instead of making API servers include an 'ok' data prop in response body,
   * this method auto injects in the ok prop using Response.ok as long as API server use the right HTTP code.
   * However the 'ok' prop is set before the spread operator so your API can return an 'ok' to override this.
   *
   * ### What about redirects?
   * You do not have to worry about this method setting `ok` to false when the HTTP response code is 300-399
   * even though it is outside of the 2XX range because by default, fetch API's option will have redirect
   * set to "follow", which means it will follow the redirect to the final API end point and only then is
   * the `ok` value set with the final HTTP response code.
   *
   * ### Using generics for TS Type Safety
   * For TS users, this method accepts a generic type to type the returned object. Allowing you to have type
   * safety for the response object. However, this DOES NOT perform any runtime data validation, so even if
   * it is type safe, it does not mean that the response object is guaranteed to be what you typed it to be.
   *
   * @todo
   * Might include a way to do response object validation, but TBD on how to implement it without bloating the library.
   *
   * Record is keyed by any type `string|number|Symbol` which an object can be indexed with
   */
  runJSON<T extends JsonResponse = JsonResponse>() {
    return safe(
      // Return type is whats expected in { res: T }
      (): Promise<T & { ok: boolean; status: number }> =>
        // It's nested this way to ensure response.ok is still accessible after parsedJSON is received
        this._run().then((response) =>
          response.json().then((parsedJSON) => ({
            // `ok` and `status` props set before `parsedJSON` is spread in to allow it to override the preceeding props
            ok: response.ok,
            status: response.status,
            ...parsedJSON,
          }))
        )
    );
  }
}
