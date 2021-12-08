/**
 * Simple fetch abstraction to refactor the API and does body stringification if needed
 * @param {String} url
 * @param {object} opts
 * @param {object | String | undefined} body
 */
export const _fetch = (url, opts = {}, body) =>
  fetch(url, {
    ...opts,

    // Only include the body field if a body value is provided
    // Stringify the body object if it isn't already
    body: body && typeof body === "object" ? JSON.stringify(body) : body,
  });

/**
 * fcf: Functional, Curried, Fetch abstraction over `_fetch`
 *
 * Allow user to pass a function for the option field to generate options/headers right before
 * the fetch call instead of generating first, to allow partially applied options that needs
 * to be generated just before the call like a time limited auth token or recaptcha token.
 */
export const fcf =
  (/** @type {String} */ baseUrl) =>
  (/** @type {String} */ path) =>
  (/** @type {RequestInit} */ opts = {}) =>
  (/** @type {object | String | undefined} */ body) =>
    _fetch(baseUrl + path, typeof opts === "function" ? opts() : opts, body);

/**
 * Header can either be an object or a function that return an object or a function that returns a Promise that resolves to an object
 * @typedef {Object | Function} Header
 */

/**
 * oof: Object Oriented Fetch abstraction over `_fetch`
 *
 * This object oriented approach gives users a familiar chainable interface to build their API calls
 */
export class oof {
  /*
    The below is commented away in v1.0.1 bug fix

    tl;dr
    As of 12 October 2021, this feature is a tc39 stage 3 proposal despite browsers like chrome shipping it already.
    And due to the new babel upgrade, projects that use this babel and this library like Vue 2 projects, will get the
    error unable to parse module and for user to get a loader for this as babel removed some plugins by default.
    Thus they will get a compile error. To make it easier for users to use, this is now changed to fallback code.

    These are resources on the feature and its current proposal stage
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
    https://github.com/tc39/proposal-static-class-features

    This are resources specifically talking about babel's removal of stage 2/3 plugins
    https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets
    https://babeljs.io/docs/en/v7-migration#switch-to--proposal--for-tc39-proposalsblog20171227nearing-the-70-releasehtmlrenames-proposal

    This are some alternatives for users who face this issue
    https://stackoverflow.com/questions/40367392/static-class-property-not-working-with-babel
    https://babeljs.io/docs/en/babel-plugin-proposal-class-properties

    However since asking users to install additional plugins to configure babel is alot harder.
    It is easier to just use es5 compatible code here straight up.
    The "static" variable will now be bounded and initialized with "" right after the class definition.


    Just like the comment above, all static methods returning a value directly can be converted to
    arrow functions assigned to a static field once the tc39 proposal passes to optimize for lib size.
  */
  // Must be initialized with empty string
  // So if user does not set any baseUrl, _baseUrl + this.path will not result in undefined + this.path
  // static _baseUrl = "";

  /**
   * Low level constructor API that generally isnt used.
   * Stick with the provided static methods for a cleaner API.
   *
   * @param {{
   *    method: String,
   *    path: String,
   *    opts?: RequestInit,
   *    header?: Header | Array<Header>,
   * }} options
   */
  constructor({ method, path, opts = {}, headers = [] }) {
    this._method = method;
    this._path = path;
    this._opts = opts;

    // Ensure that this._headers is always an array regardless of what the user passes in
    // Users can pass in a single header object/function or an array of header objects/functions
    // If an array is passed in, leave it as it is, else wrap the single header object/function in a array
    this._headers = Array.isArray(headers) ? headers : [headers];
  }

  /**
   * Wrapper function over constructor to make the constructor API more ergonomic.
   *
   * This exposed static method allows users to use HTTP methods that are not provided by default.
   * This method is meant for HTTP methods like GET that do not allow entity bodies.
   * Although the provided GET and DEL methods can use this method internally,
   * they do not use this so as to optimize away the additional function call.
   * @param {String} method The CAPITALISED verb string of the HTTP method
   * @param {String} path
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static _METHODS_WO_DATA(method, path) {
    return new oof({ method, path });
  }

  /**
   * Wrapper function over constructor to make the constructor API more ergonomic.
   *
   * This static method allows users to use HTTP methods like POST that have JSON entity bodies
   * @param {String} method The CAPITALISED verb string of the HTTP method
   * @param {String} path
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static _METHODS_WITH_DATA(method, path) {
    return new oof({
      method,
      path,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `GET` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static GET(path) {
    return new oof({ method: "GET", path });
  }

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `POST` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static POST(path) {
    return oof._METHODS_WITH_DATA("POST", path);
  }

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `PUT` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static PUT(path) {
    return oof._METHODS_WITH_DATA("PUT", path);
  }

  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `DEL` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static DEL(path) {
    return new oof({ method: "DEL", path });
  }

  /**
   * Set options for the fetch method call. Usually used to set custom RequestInit parameters.
   * This is generally not used unless you have specific options to pass in e.g. cache: "no-cache".
   *
   * Note that passing in a header object here will override all headers passed in via the 'header' method.
   * Because these options are merged with the header object using a shallow merge.
   *
   * This method directly assigns the arguement to `this._opts` which means calling this method overrides
   * whatever options that is already set previously. Because it does not make sense for the user to call
   * this repeatedly since there is no default options set by this library anyways. Thus it is a direct
   * assignment instead of a merge like `this._opts = { ...this._opts, ...opts }`
   *
   * @param {RequestInit} opts Options object used as the RequestInit object
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  options(opts) {
    this._opts = opts;
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
   * @param {Header} header
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  header(header) {
    this._headers.push(header);
    return this;
  }

  /**
   * Set data/object to be sent to server in API calls for methods such as POST/PUT
   * @param {object} data
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  data(data) {
    this._data = data;
    return this;
  }

  /** Call method after constructing the API call object to make the API call */
  async run() {
    return _fetch(
      // Check if `this._path` contains any http protocol identifier using a case-insensitive regex match
      // If found, assume user passed in full URL to skip using base URL, thus use `this._path` directly as full URL
      // Else prepend base URL to `this._path` to get the full URL
      this._path.match(/https:\/\/|http:\/\//i)
        ? this._path
        : oof._baseUrl + this._path,
      {
        method: this._method,

        // Run header functions if any to ensure array of headers is now an array of header objects,
        // The array of headers have the type of `object | Promise<object>` because header generator
        // functions can be an async, to let users delay generating headers until `run` time.
        //
        // `await Promise.all` on the array of headers to ensure all are resolved to `object` type,
        // before reducing the array of header objects into a single header object.
        headers: (
          await Promise.all(
            this._headers.map((header) =>
              typeof header === "function" ? header() : header
            )
          )
        ).reduce((obj, item) => ({ ...obj, ...item }), {}),

        // Add and/or Override defaults if any
        // If there is a headers property in this options object, it will override the headers entirely
        // Also options merging is a shallow merge not a deepmerge
        ...this._opts,
      },
      this._data
    );
  }

  /**
   * Wrapper around `run` method to auto parse return data as JSON before returning
   * @returns {Promise<object>} The parsed JSON response
   *
   * When API server responds with a status code of anything outside of 200-299 Response.ok is auto set to false
   * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
   * https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
   *
   * Thus instead of making API servers include an 'ok' data prop in response body,
   * this method auto injects in the ok prop using Response.ok as long as API server use the right HTTP code.
   * However the 'ok' prop is set before the spread operator so your API can return an 'ok' to override this.
   */
  runJSON() {
    // It's nested this way to ensure response.ok is still accessible after parsedJSON is received
    return this.run().then((response) =>
      response.json().then((parsedJSON) => ({ ok: response.ok, ...parsedJSON }))
    );
  }
}

// See top for explaination on why this is initialized this way instead of using a class static variable.
oof._baseUrl = "";
