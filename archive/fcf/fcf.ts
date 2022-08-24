import { _fetch } from "../_fetch/_fetch.js";

/**
 * fcf: Functional, Curried, Fetch abstraction over `_fetch`
 *
 * Allow user to pass a function (can be async) for the option field to generate options/headers right before
 * the fetch call instead of generating first, to allow partially applied options that needs
 * to be generated just before the call like a time limited auth token or recaptcha token.
 */
export const fcf =
  (baseUrl: string) =>
  (path: string) =>
  (opt: RequestInit | Function = {}) =>
  async (body?: object | string) =>
    _fetch(baseUrl + path, typeof opt === "function" ? await opt() : opt, body);
