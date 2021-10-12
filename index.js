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
  (baseUrl) =>
  (path) =>
  (opts = {}) =>
  (body) =>
    _fetch(baseUrl + path, typeof opts === "function" ? opts() : opts, body);

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
  */
  // Must be initialized with empty string
  // So if user does not set any baseUrl, _baseUrl + this.path will not result in undefined + this.path
  // static _baseUrl = "";

  /**
   * Base/Common/Low level constructor that generally isnt used.
   * Stick with the provided static methods for a cleaner API.
   */
  constructor({ method, path, opts = {}, headers }) {
    this._method = method;
    this._path = path;
    this._opts = opts;

    // Headers defaults to an empty array unless given a header object
    this._headers = headers ? [headers] : [];

    // This is always undefined unless user passes in something using the data() setter method
    // This used to be set here to provide type inference in some situations
    // this._data = undefined;
  }

  /**
   * This exposed static method allows users to use HTTP methods that are not provided by default.
   * This method is meant for HTTP methods (e.g. GET) that do not allow entity bodies
   * @param {String} method The CAPITALISED verb string of the HTTP method
   * @param {String} path
   * @returns {oof} Returns 'this' to allow user to chain their methods
   */
  static _METHODS_WO_DATA(method, path) {
    return new oof({ method, path });
  }

  /**
   * This exposed static method allows users to use HTTP methods that are not provided by default.
   * This method is meant for HTTP methods (e.g. POST) that support a entity body with JSON encoding.
   * @param {String} method The CAPITALISED verb string of the HTTP method
   * @param {String} path
   * @returns {oof} Returns 'this' to allow user to chain their methods
   */
  static _METHODS_WITH_DATA(method, path) {
    return new oof({
      method,
      path,
      headers: { "Content-Type": "application/json" },
    });
  }

  static GET(path) {
    return new oof({ method: "GET", path });
  }

  static POST(path) {
    return oof._METHODS_WITH_DATA("POST", path);
  }

  static PUT(path) {
    return oof._METHODS_WITH_DATA("PUT", path);
  }

  static DEL(path) {
    return new oof({ method: "DEL", path });
  }

  /**
   * NOTE THAT CALLING THIS WILL SET BASE URL FOR ALL FUTURE CALLS
   * @param {String} url
   * @returns {oof} Returns the class for you to start calling a static method like GET/POST
   */
  static baseUrl(url) {
    oof._baseUrl = url;

    // Returns the class for user to chain another static method call
    return oof;
  }

  /**
   * Set the path of the API call. Path will be appended to the 'baseUrl'
   * @param {String} path
   */
  path(path) {
    this._path = path;

    // Return 'this' to allow user to chain their methods
    return this;
  }

  /**
   * Set options for the fetch method call.
   * Note that passing in a header object here will override all headers passed in via the 'header' method.
   * This is generally not used unless you have specific options to pass in e.g. cache: "no-cache".
   *
   * Note that the options merging is a shallow merge not a deepmerge.
   * @param {object} opts
   */
  options(opts) {
    this._opts = opts;

    // Return 'this' to allow user to chain their methods
    return this;
  }

  /**
   * Header objects to include in the API call.
   * Accepts plain header objects, and also functions.
   * Functions passed in will be called right before the API call to generate a header object,
   * to delay generating certain header values like a time limited auth token or recaptcha.
   * This method can be called multiple times, and all the header objects will be combined.
   * @param {object | Function} header
   */
  header(header) {
    this._headers.push(header);

    // Return 'this' to allow user to chain their methods
    return this;
  }

  /**
   * Set data/object to be sent to server in API calls for methods such as POST/PUT
   * @param {object} data
   */
  data(data) {
    this._data = data;

    // Return 'this' to allow user to chain their methods
    return this;
  }

  /** Call method after constructing the API call object to make the API call */
  run() {
    return _fetch(
      oof._baseUrl + this._path,
      {
        method: this._method,

        // Run all the header functions if any to ensure array of headers is now an array of header objects
        // Reduce the array of header objects into a single header object
        headers: this._headers
          .map((header) => (typeof header === "function" ? header() : header))
          .reduce((obj, item) => ({ ...obj, ...item }), {}),

        // Add and/or Override defaults if any
        // If there is a headers property in this options object, it will override the headers entirely
        // Also options merging is a shallow merge not a deepmerge
        ...this._opts,
      },
      this._data
    );
  }

  /** Wrapper around `run` method to auto parse return data as JSON before returning */
  runJSON() {
    return this.run().then((response) => response.json());
  }
}

// See top for explaination on why this is initialized this way instead of using a class static variable.
oof._baseUrl = "";
