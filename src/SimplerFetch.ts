import type { BaseUrlConfig, HTTPMethod } from "./types";
import { UrlBuilder } from "./UrlBuilder";

/**
 * `SimplerFetch` is used to create an Object Oriented `fetch api` abstraction
 * to give users an easy to use chainable interface (builder pattern) to build
 * their API calls.
 */
export class SimplerFetch<
  const SimplerFetchConfig extends {
    baseUrlConfigs?: Record<string, BaseUrlConfig>;
  },
  const BaseUrlIdentifiers extends "baseUrlConfigs" extends keyof SimplerFetchConfig
    ? keyof SimplerFetchConfig["baseUrlConfigs"]
    : never
> {
  constructor(public readonly config: SimplerFetchConfig) {}

  #ChainToUrlBuilder = <const HTTPMethodUsed extends HTTPMethod>(
    method: HTTPMethodUsed
  ) =>
    new UrlBuilder<BaseUrlIdentifiers, HTTPMethodUsed>(
      // Create a new object that will be the chainable fetch config object
      // threaded through all the Builder class instances, and fill it in with
      // any required default values too.
      {
        method,
        options: {},
        headers: [],
      },
      this.config.baseUrlConfigs as Exclude<
        SimplerFetchConfig["baseUrlConfigs"],
        undefined
      >
    );

  /** Make a `HEAD` API call */
  HEAD = () => this.#ChainToUrlBuilder("HEAD");

  /** Make a `OPTIONS` API call */
  OPTIONS = () => this.#ChainToUrlBuilder("OPTIONS");

  /** Make a `GET` API call */
  GET = () => this.#ChainToUrlBuilder("GET");

  /** Make a `POST` API call */
  POST = () => this.#ChainToUrlBuilder("POST");

  /** Make a `PUT` API call */
  PUT = () => this.#ChainToUrlBuilder("PUT");

  /** Make a `PATCH` API call */
  PATCH = () => this.#ChainToUrlBuilder("PATCH");

  /** Make a `DELETE` API call */
  DEL = () => this.#ChainToUrlBuilder("DELETE");
}
