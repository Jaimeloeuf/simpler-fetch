/**
 * All the supported HTTP methods.
 * Ref: https://fetch.spec.whatwg.org/#methods
 *
 * Based on the reference link, although there are other HTTP methods, they are
 * not supported by the `fetch` spec, and therefore not included in this union
 * type as even if you could pass it to the `fetch` function, it will just fail.
 *
 * Exporting this type so that you can explicitly type your HTTP method strings
 * as needed to ensure that they are correctly typed at point of value
 * definition instead of only type checking when you call the constructor.
 */
export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";
