export function _fetch(
  url: string,
  opts: object,
  body: object | string | undefined
): Promise<Response>;
export function fcf(
  baseUrl: string
): (
  path: string
) => (
  opts?: RequestInit
) => (body: object | string | undefined) => Promise<Response>;
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
  static _METHODS_WO_DATA(method: string, path: string): oof;
  /**
   * Wrapper function over constructor to make the constructor API more ergonomic.
   *
   * This static method allows users to use HTTP methods like POST that have JSON entity bodies
   * @param {String} method The CAPITALISED verb string of the HTTP method
   * @param {String} path
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static _METHODS_WITH_DATA(method: string, path: string): oof;
  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `GET` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static GET(path: string): oof;
  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `POST` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static POST(path: string): oof;
  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `PUT` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static PUT(path: string): oof;
  /**
   * Wrapper function over constructor to construct a new `oof` instance for a `DEL` API call
   *
   * @param {String} path Path of your API
   * @returns {oof} Returns a new instance of `oof` after constructing it to let you chain method calls
   */
  static DEL(path: string): oof;
  /**
   * Low level constructor API that generally isnt used.
   * Stick with the provided static methods for a cleaner API.
   *
   * @param {{
   *    method: String,
   *    path: String,
   *    opts?: RequestInit,
   *    headers?: Header | Array<Header>,
   * }} options
   */
  constructor({
    method,
    path,
    opts,
    headers,
  }: {
    method: string;
    path: string;
    opts?: RequestInit;
    headers?: Header | Array<Header>;
  });
  _method: string;
  _path: string;
  _opts: RequestInit;
  _headers: Header[];
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
  options(opts: RequestInit): oof;
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
  header(header: Header): oof;
  /**
   * Set data/object to be sent to server in API calls for methods such as POST/PUT
   * @param {object} data
   * @returns {oof} Returns the current instance of `oof` to let you chain method calls
   */
  data(data: object): oof;
  _data: Object;
  /** Call method after constructing the API call object to make the API call */
  run(): Promise<Response>;
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
  runJSON(): Promise<object>;
}
export namespace oof {
  const _baseUrl: string;
}
/**
 * Header can either be an object or a function that return an object or a function that returns a Promise that resolves to an object
 */
export type Header = Object | Function;
