import { Fetch } from "./Fetch";
import type { BaseUrlConfigWithOptionalDefaults, HTTPMethod } from "./types";

export class MethodBuilder {
  constructor(
    private readonly baseUrlConfig: BaseUrlConfigWithOptionalDefaults
  ) {}

  /**
   * Standard API for creating a new `Fetch` instance
   */
  #CreateFetch = (method: HTTPMethod, path: string = "") =>
    new Fetch(
      method,
      this.baseUrlConfig.url + path,

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
      this.baseUrlConfig.defaultOptions,
      this.baseUrlConfig.defaultHeaders
    );

  /** Construct a new `Fetch` instance to make a `GET` API call */
  HEAD = (path?: string) => this.#CreateFetch("HEAD", path);

  /** Construct a new `Fetch` instance to make a `GET` API call */
  OPTIONS = (path?: string) => this.#CreateFetch("OPTIONS", path);

  /** Construct a new `Fetch` instance to make a `GET` API call */
  GET = (path?: string) => this.#CreateFetch("GET", path);

  /** Construct a new `Fetch` instance to make a `POST` API call */
  POST = (path?: string) => this.#CreateFetch("POST", path);

  /** Construct a new `Fetch` instance to make a `PUT` API call */
  PUT = (path?: string) => this.#CreateFetch("PUT", path);

  /** Construct a new `Fetch` instance to make a `PATCH` API call */
  PATCH = (path?: string) => this.#CreateFetch("PATCH", path);

  /** Construct a new `Fetch` instance to make a `DELETE` API call */
  DEL = (path?: string) => this.#CreateFetch("DELETE", path);
}
