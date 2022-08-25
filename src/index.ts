/**
 * Header can either be,
 * 1. An object
 * 2. A function that return an object
 * 3. A function that returns a Promise that resolves to an object
 */
type Header =
  | Record<string, any>
  | (() => Record<string, any>)
  | (() => Promise<Record<string, any>>);

/** All the supported HTTP methods */
type HTTPMethod =
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

/**
 * JsonResponse type is used as the base type for what can be returned from the server when using `runJSON()`.
 *
 * Note that this type is not a JSON type as this only support `{}` based types and all the other JSON string forms are not supported such as arrays or single strings.
 *
 * The reason why the other types are not supported is because the runJSON method actually injects the values of `ok` and `status` into the response before returning it.
 */
type JsonResponse = Record<string | number | symbol, any>;

/**
 * Function wrapper to ensure that any of the `run` methods will not throw/bubble up any errors to the users,
 * instead all values and errors will be encapsulated into a monadic like structure for user to destructure out.
 * This takes inspiration from how Go-lang does error handling, where they can deal with errors sequentially,
 * without having to deal with jumping control flows with try/catch blocks.
 *
 * Go-lang error handling reference: https://go.dev/blog/error-handling-and-go
 *
 * @param fn Takes in any function to wrap around to prevent errors from bubbling up
 * @returns Returns either the result of the function call or an error if any is thrown, encapsulating both in an object that can be destructed
 */
const safe = <T>(
  fn: () => Promise<T>
): Promise<{ res: T; err: undefined } | { res: undefined; err: Error }> =>
  fn()
    .then((res) => ({ res, err: undefined }))
    .catch((err) => ({ err, res: undefined }));

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
   * This is a static private variable that is only accessible from within this
   * class's static method.
   */
  static #defaultOpts: any;

  /**
   * Static method to set default options that will be applied to all API calls.
   * The options set here can be overwritten one-off in specific API calls using
   * the `options` method.
   *
   * This static method does not return the `oof` class to specifically be
   * unchainable, so that users do not mistakenly use this in an API call,
   * and it will be more explicit when they set default options.
   */
  static defaultOptions(opts: RequestInit): void {
    oof.#defaultOpts = opts;
  }

  /* Private Instance variables that are only accessible internally */
  #method: HTTPMethod;
  #headers: Array<Header>;
  #path: string;
  #opts: RequestInit;

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

  /** Low level constructor API that generally isnt used. Stick with the provided static methods for a cleaner API. */
  constructor({
    method,
    path,
    opts = {},
    headers = [],
  }: {
    method: HTTPMethod;
    path: string;
    opts?: RequestInit;
    headers?: Header | Array<Header>;
  }) {
    this.#method = method;
    this.#path = path;
    this.#opts = opts;

    // Ensure that this.#headers is always an array regardless of what the user passes in
    // Users can pass in a single header object/function or an array of header objects/functions
    // If an array is passed in, leave it as it is, else wrap the single header object/function in a array
    this.#headers = Array.isArray(headers) ? headers : [headers];
  }

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `GET` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static GET = (path: string): oof => new oof({ method: "GET", path });

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `POST` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static POST = (path: string): oof => new oof({ method: "POST", path });

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `PUT` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static PUT = (path: string): oof => new oof({ method: "PUT", path });

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `DEL` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static DEL = (path: string): oof => new oof({ method: "DELETE", path });

  /**
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
   *
   * @param {RequestInit} opts RequestInit object for this one API call
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  options(opts: RequestInit): oof {
    this.#opts = opts;
    return this;
  }

  /**
   * Add Headers to include in the API call.
   *
   * Accepts plain header objects, functions and async functions.
   *
   * Functions passed in will be called right before the API call to generate a header object,
   * to delay generating certain header values like a time limited auth token or recaptcha.
   *
   * This method can be called multiple times, and all the header objects will be combined.
   *
   * For TS users, this method accepts a generic type that extends the Header type.
   *
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  header<T extends Header>(header: T): oof {
    this.#headers.push(header);
    return this;
  }

  /**
   * Set data/object to be sent to server in API calls for methods such as POST/PUT.
   *
   * The type of data that can be passed in, is any JS value that can be JSON serialized with `JSON.stringify()`.
   * See this [MDN link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description) on what type of data can be passed in.
   *
   * For TS users, this method accepts a generic type that extends the Header type.
   *
   * Even though there is no default arguement, you do not have to call the `.data` method with an empty object when
   * calling a method like `oof.POST` as `fetch` and API services will just treat it as an empty object by default.
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
   * Method that stringifies a JSON stringifiable data type to use as the request body,
   * and sets the content-type to 'application/json'.
   *
   * Why does this method exists?
   * Because, the `_run` method needs to accept too many data input types,
   * so instead of doing all the processing and transforming then, the specific
   * transformations should be done in helper methods like this so that in the
   * actual `fetch` call, we can just set `body: this.#body` directly.
   *
   * Why not just use the `body` method?
   * Since JSON is one of the most popular methods of communication over HTTP,
   * this method helps users to write less code by helping them stringify their
   * JS object and set the content-type header to 'application/json', instead
   * of requiring them to explicitly call `.body(JSON.stringify(data), "application/json")`
   * every single time they want to send JSON data to their API servers.
   *
   * @param data Any data type that is of 'application/json' type and can be stringified by JSON.stringify
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
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
   * This is the underlying raw `_run` method, that is called internally after constructing
   * the API call object to make the API call, and it should not be used by users directly.
   * See the other run methods, `run`, `runJSON`, `runText`, `runBlob`, `runFormData`, `runArrayBuffer`.
   *
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
   * This method is basically a wrapper around the fetch API. After configuring all the values using
   * the object oriented notation (method chaining), when you call `_run`, it basically takes all the
   * values on its instance props and use these as option values for the fetch API's RequestInit
   * parameter while taking care of certain things like creating the full API url using any baseUrl
   * set with `setBaseUrl`, delayed header generation and etc...
   */
  async _run(): Promise<Response> | never {
    // This library does not check if `fetch` is available in the global scope,
    // it assumes it exists, if it does not exists, please load a `fetch` polyfill first!
    return fetch(
      // Check if `this.#path` contains any http protocol identifier using a case-insensitive regex match
      // If found, assume user passed in full URL to skip using base URL, thus use `this.#path` directly as full URL
      // Else prepend base URL to `this.#path` to get the full URL
      this.#path.match(/https:\/\/|http:\/\//i)
        ? this.#path
        : oof.#baseUrl + this.#path,
      {
        /*
          Properties are set following the order of specificity:
          1. `defaultOptions` is the most generic so it is be applied first
          2. instance specific options is applied right after so it can override default options as needed
          3. the HTTP method, which cannot be overwritten by either default or instance options
          4. the instance specific headers, which cannot be overwritten by either default or instance options
          5. the instance specific body data, which cannot be overwritten by either default or instance options

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
        // functions can be an async, to let users delay generating headers until `run` time.
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
      }
    );
  }

  /*
    Below are safe 'run' methods that will not throw / let any async errors bubble up.
    These methods are wrapped with the `safe` function and return {res, err} to force
    users to explicitly handle it with type narrowing instead of letting caller handle
    any errors/exceptions thrown by the run methods, making it more type safe and explicit.
  */

  /**
   * Safe version of the `run` method that will not throw/bubble up any errors.
   *
   * @example <caption>Using await to handle await at the same scope level</caption>
   * ```javascript
   * const { res, err } = await oof.GET("/api").runSafe();
   *
   * if (err) {
   *    return console.log("Something went wrong!");
   * }
   *
   * console.log("Res:", res);
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

  /** Abstraction on top of the `_run` method to return response body parsed as text */
  runText() {
    return safe(() => this._run().then((res) => res.text()));
  }

  /** Abstraction on top of the `_run` method to return response body parsed as Blob */
  runBlob() {
    return safe(() => this._run().then((res) => res.blob()));
  }

  /** Abstraction on top of the `_run` method to return response body parsed as FormData */
  runFormData() {
    return safe(() => this._run().then((res) => res.formData()));
  }

  /** Abstraction on top of the `_run` method to return response body parsed as ArrayBuffer */
  runArrayBuffer() {
    return safe(() => this._run().then((res) => res.arrayBuffer()));
  }

  /**
   * Abstraction on top of the `_run` method to return response body parsed as JSON.
   *
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
   * You do not have to worry about this method setting `ok` to false when the HTTP response code is 300-399
   * even though it is outside of the 2XX range because by default, fetch API's option will have redirect
   * set to "follow", which means it will follow the redirect to the final API end point and only then is
   * the `ok` value set with the final HTTP response code.
   *
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

    // Alternatively, a clearer way to implement this is with async/await but it cost extra bytes.
    // return safe(async (): Promise<T & { ok: boolean; status: number }> => {
    //   const response = await this._run();
    //   const parsedJSON = await response.json();
    //   return { ok: response.ok, status: response.status, ...parsedJSON };
    // });
  }
}
