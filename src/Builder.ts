import { Fetch } from "./Fetch";
import type { Header, HTTPMethod } from "./types";

/**
 * Class used to implement the Builder pattern for creating `Fetch` instances.
 * This class should only be used internally by `sf` and should not be exposed
 * to library users since they should not be using this to make API calls.
 */
export class Builder {
  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  /**
   * This is the base URL used for all API calls made through this instance.
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
   * one-off in specific API calls with the `options` method of `Fetch` class.
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
   * The options set here can be overridden one-off in specific API calls with
   * the `useOptions` method of `Fetch` class.
   *
   * Note that everytime this is called, all the default options are overwritten
   * to use the options passed in as the new default options without merging
   * with the original default options. Note that this behavior **CANNOT** be
   * changed since the `HTTP` method's `Fetch` instantiation relies on this.
   * This is to ensure that any modifications to the default values will not
   * affect the already instantiated `Fetch` instances, since the `Fetch`
   * instances will still hold on to the original container value's reference.
   * This prevent certain security risks such as dynamically changing the
   * `credentials` property to include it even when the original default option
   * is to omit it.
   * See commit f947ec0b590286b45dfccfc6229dba3550411c6a
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
   * one-off in specific API calls with the `useHeader` method of `Fetch` class.
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
   * The headers set here can be overwritten one-off in specific API calls with
   * the `useHeader` method of `Fetch` class.
   *
   * Useful for doing things like passing in a function to generate auth header,
   * so that the function does not need to be passed in for every API call made
   * with the `Fetch` instance. Another example is if every API call needs a
   * recaptcha token, instead of passing in the recaptcha token header generator
   * function everywhere, this can be set just once as a default header value.
   *
   * Note that everytime this is called, the default headers is overwritten
   * to use the headers passed in as the new default headers without merging
   * with the original default headers. Note that this behavior **CANNOT** be
   * changed since the `HTTP` method's `Fetch` instantiation relies on this.
   * This is to ensure that any modifications to the default values will not
   * affect the already instantiated `Fetch` instances, since the `Fetch`
   * instances will still hold on to the original container value's reference.
   * This prevent certain security risks such as dynamically changing the
   * certain sensitive header values.
   * See commit f947ec0b590286b45dfccfc6229dba3550411c6a
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
   * Standard API for creating a new `Fetch` instance
   */
  HTTP = (method: HTTPMethod, path: string = "") =>
    new Fetch(
      method,
      this.#baseUrl + path,

      // Pass default options object and default headers array as references
      // to the new Fetch instance, so that library users can use the Fetch
      // methods `useDefaultOptions` and `useDefaultHeaders` to update the
      // options object or headers array to use the default values.
      //
      // Passing as reference is safe since these containers and the inner
      // content will not be mutated by the Fetch instance.
      //
      // Even if the default values are mutated before the API call is ran and
      // finalized, it is still fine, since all modification to the default
      // values through the `setDefaultOptions` and `setDefaultHeaders` methods
      // replaces the entire object/array, meaning that the Fetch instance will
      // still hold the reference to the original container value and not be
      // affected by the change. This the reason why those methods cannot be
      // modified, they must replace the original container value instead of
      // extending/merging them which will cause default values in the already
      // created Fetch instance to be modified dynamically, potentially causing
      // bugs that might have security risks, e.g. modifying the credentials
      // property on the options object dynamically.
      this.#defaultOpts,
      this.#defaultHeaders
    );

  /** Construct a new `Fetch` instance to make a `GET` API call */
  HEAD = (path?: string) => this.HTTP("HEAD", path);

  /** Construct a new `Fetch` instance to make a `GET` API call */
  OPTIONS = (path?: string) => this.HTTP("OPTIONS", path);

  /** Construct a new `Fetch` instance to make a `GET` API call */
  GET = (path?: string) => this.HTTP("GET", path);

  /** Construct a new `Fetch` instance to make a `POST` API call */
  POST = (path?: string) => this.HTTP("POST", path);

  /** Construct a new `Fetch` instance to make a `PUT` API call */
  PUT = (path?: string) => this.HTTP("PUT", path);

  /** Construct a new `Fetch` instance to make a `PATCH` API call */
  PATCH = (path?: string) => this.HTTP("PATCH", path);

  /** Construct a new `Fetch` instance to make a `DELETE` API call */
  DEL = (path?: string) => this.HTTP("DELETE", path);
}
