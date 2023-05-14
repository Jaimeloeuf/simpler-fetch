// Temporarily doing a rename to not change any `Builder` code first
import { RequestBuilder as Fetch } from "./Fetch2";
import type { Header, HTTPMethod } from "./types";

/**
 * Class used to implement the Builder pattern for creating `Fetch` instances.
 * This class should only be used internally by `oof` and should not be exposed
 * to library users since they should not be using this to make API calls.
 */
export class Builder {
  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  /**
   * This is the base URL used for all API calls that specify a relative API URL.
   *
   * This is a readonly property as it should not be changed once set via the
   * constructor. This is a private variable as it does not need to be accessed
   * by any library users since they can find the baseUrl at the location where
   * it is being set in their own code.
   */
  readonly #baseUrl: string;

  /**
   * Default options that will be applied to all API calls, which can be set
   * using the `setDefaultOptions` method. These options can be overwritten
   * one-off in specific API calls using the `options` method of `Fetch` class.
   *
   * Useful for doing things like setting the 'mode' of the request, e.g., cors,
   * no-cors, or same-origin. Use the link to see all the default options that
   * you can set like mode/credentials/cache/redirect:
   * https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
   *
   * This is a private variable as it should not be exposed to library users.
   * This defaults to an empty object as it is optional but should be strongly
   * typed to work with the type expected by the `Fetch` class.
   */
  #defaultOpts: RequestInit = {};

  /**
   * Method to set default options that will be applied to all API calls made
   * through the `Fetch` instance created by this `Builder` instance.
   * The options set here can be overwritten one-off in specific API calls using
   * the `options` method of `Fetch` class.
   *
   * Note that everytime this is called, all the default options are overwritten
   * to use the options passed in as the new default options without merging with
   * the original default options.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  setDefaultOptions(opts: RequestInit): Builder {
    this.#defaultOpts = opts;
    return this;
  }

  /**
   * Default headers that will be applied to all API calls, which can be set
   * using the `setDefaultHeaders` method. These headers can be overwritten
   * one-off in specific API calls using the `header` method of `Fetch` class.
   *
   * Useful for doing things like passing in a function to generate auth header,
   * so that the function does not need to be passed in for every API call made
   * with the `Fetch` instance.
   *
   * This is a private variable as it should not be exposed to library users.
   * This defaults to an empty array as it is optional but should be strongly
   * typed to work with the type expected by the `Fetch` class.
   */
  #defaultHeaders: Array<Header> = [];

  /**
   * Method to set default headers that will be applied to all API calls made
   * through the `Fetch` instance created by this `Builder` instance.
   * The headers set here can be overwritten one-off in specific API calls using
   * the `header` method of `Fetch` class.
   *
   * Useful for doing things like passing in a function to generate auth header,
   * so that the function does not need to be passed in for every API call made
   * with the `Fetch` instance. Another example is if every API call needs a
   * recaptcha token, instead of passing in the recaptcha token header generator
   * function everywhere, this can be set just once as a default header value.
   *
   * Note that everytime this is called, the default headers is fully overwritten
   * to use the headers passed in as the new default headers without merging with
   * the original default headers.
   *
   * The `headers` function parameter forces the caller to pass in at least one
   * argument for this variadic method. See https://stackoverflow.com/a/72286990
   *
   * @returns Returns the current instance to let you chain method calls
   */
  setDefaultHeaders(...headers: [Header, ...Header[]]): Builder {
    this.#defaultHeaders = headers;
    return this;
  }

  /**
   * tl;dr Do not use this unless you know what you are doing.
   *
   * ### About
   * Wrapper function over `Fetch` constructor to construct a new
   * instance with the given HTTP method and path alongside the
   * values set on this `Builder` instance.
   *
   * ### Library Users
   * For the most part, library users ***SHOULD NOT*** be using this
   * low level API, instead they should use the methods named after
   * the HTTP methods such as builder.GET, builder.POST and so on.
   * The only reason why this is made public is for users who want
   * to use HTTP methods like `HEAD` and `OPTION` to still be able
   * to do so using our library instead of doing some crazy hack,
   * since there is no method for those specific HTTP methods.
   */
  HTTP = (method: HTTPMethod, path: string) =>
    new Fetch(
      method,
      this.#baseUrl + path,

      // Use spread operator to create shallow copies, so that the
      // default options and headers value in this builder instance
      // will not be modified when the `Fetch` instance modifies
      // the values by adding more headers or merging in options.
      //
      // A shallow copy will do since the values itself will not be
      // touched by `Fetch`, only the target container, i.e. only
      // the options object and the headers array will be modified.
      { ...this.#defaultOpts },
      [...this.#defaultHeaders]
    );

  /** Construct a new `Fetch` instance to make a `GET` API call */
  GET = (path: string = "") => this.HTTP("GET", path);

  /** Construct a new `Fetch` instance to make a `POST` API call */
  POST = (path: string = "") => this.HTTP("POST", path);

  /** Construct a new `Fetch` instance to make a `PUT` API call */
  PUT = (path: string = "") => this.HTTP("PUT", path);

  /** Construct a new `Fetch` instance to make a `PATCH` API call */
  PATCH = (path: string = "") => this.HTTP("PATCH", path);

  /** Construct a new `Fetch` instance to make a `DELETE` API call */
  DEL = (path: string = "") => this.HTTP("DELETE", path);
}
