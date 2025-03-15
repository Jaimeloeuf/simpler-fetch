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
      // to the new Fetch instance. Passing reference is safe since these
      // containers and its inner content will not be mutated by `Fetch`.
      this.baseUrlConfig.defaultOptions,
      this.baseUrlConfig.defaultHeaders
    );

  /** Construct a new `Fetch` instance to make a `HEAD` API call */
  HEAD = (path?: string) => this.#CreateFetch("HEAD", path);

  /** Construct a new `Fetch` instance to make a `OPTIONS` API call */
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
