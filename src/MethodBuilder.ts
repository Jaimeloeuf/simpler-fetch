import { RequestBodyBuilder } from "./RequestBodyBuilder";
import type { BaseUrlConfigWithOptionalDefaults, HTTPMethod } from "./types";

/**
 * Class used by `SimplerFetch` to ensure that users chain their fetch call /
 * use the builder pattern in a specific order, where the HTTP Method is
 * specified first before any of the other configs / options.
 */
export class MethodBuilder<
  /**
   * Is the `MethodBuilder` being used with a base URL or a full URL?
   */
  const IsFullUrl extends boolean = false,
  /**
   * Path will either be string for base URL use, or never/undefined when using
   * a full URL.
   */
  const Path extends IsFullUrl extends true
    ? never
    : string = IsFullUrl extends true ? never : string
> {
  constructor(
    private readonly baseUrlConfig: BaseUrlConfigWithOptionalDefaults
  ) {}

  #CreateRequestBodyBuilder = (method: HTTPMethod, path: string = "") =>
    new RequestBodyBuilder(
      method,
      this.baseUrlConfig.url + path,

      // Pass default options object and default headers array as references
      // to the new Fetch instance. Passing reference is safe since these
      // containers and its inner content will not be mutated by `Fetch`.
      this.baseUrlConfig.defaultOptions,
      this.baseUrlConfig.defaultHeaders
    );

  /** Construct a new `Fetch` instance to make a `HEAD` API call */
  HEAD = (path?: Path) => this.#CreateRequestBodyBuilder("HEAD", path);

  /** Construct a new `Fetch` instance to make a `OPTIONS` API call */
  OPTIONS = (path?: Path) => this.#CreateRequestBodyBuilder("OPTIONS", path);

  /** Construct a new `Fetch` instance to make a `GET` API call */
  GET = (path?: Path) => this.#CreateRequestBodyBuilder("GET", path);

  /** Construct a new `Fetch` instance to make a `POST` API call */
  POST = (path?: Path) => this.#CreateRequestBodyBuilder("POST", path);

  /** Construct a new `Fetch` instance to make a `PUT` API call */
  PUT = (path?: Path) => this.#CreateRequestBodyBuilder("PUT", path);

  /** Construct a new `Fetch` instance to make a `PATCH` API call */
  PATCH = (path?: Path) => this.#CreateRequestBodyBuilder("PATCH", path);

  /** Construct a new `Fetch` instance to make a `DELETE` API call */
  DEL = (path?: Path) => this.#CreateRequestBodyBuilder("DELETE", path);
}
