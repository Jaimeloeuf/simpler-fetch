import { _fetch } from "./_fetch";

/**
 * fcf: Functional, Curried, Fetch abstraction over `_fetch`
 *
 * Allow user to pass a function for the option field to generate options/headers right before
 * the fetch call instead of generating first, to allow partially applied options that needs
 * to be generated just before the call like a time limited auth token or recaptcha token.
 */
export const fcf =
  (baseUrl: string) =>
  (path: string) =>
  (opts: RequestInit | Function = {}) =>
  (body?: object | string) =>
    _fetch(baseUrl + path, typeof opts === "function" ? opts() : opts, body);
