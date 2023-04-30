import { Fetch } from "./Fetch";
import type { HTTPMethod } from "./types/index";

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
   * to use the options passed in as the new default options without merging the
   * original default options set.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  setDefaultOptions(opts: RequestInit): Builder {
    this.#defaultOpts = opts;
    return this;
  }

  /**
   * Wrapper function over `Fetch` constructor to construct a new
   * instance with the values on this `Builder` instance.
   */
  create = (method: HTTPMethod, path: string) =>
    new Fetch(method, this.#baseUrl + path, this.#defaultOpts);

  /** Construct a new `Fetch` instance to make a `GET` API call */
  GET = (path: string = "") => this.create("GET", path);

  /** Construct a new `Fetch` instance to make a `POST` API call */
  POST = (path: string = "") => this.create("POST", path);

  /** Construct a new `Fetch` instance to make a `PUT` API call */
  PUT = (path: string = "") => this.create("PUT", path);

  /** Construct a new `Fetch` instance to make a `PATCH` API call */
  PATCH = (path: string = "") => this.create("PATCH", path);

  /** Construct a new `Fetch` instance to make a `DELETE` API call */
  DEL = (path: string = "") => this.create("DELETE", path);
}
