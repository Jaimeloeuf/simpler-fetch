/**
 * All the supported HTTP methods.
 * Ref: https://fetch.spec.whatwg.org/#methods
 *
 * Based on the reference link, although there are other HTTP methods, they are
 * not supported by the `fetch` spec, and therefore not included in this union
 * type as even if you could pass it to the `fetch` function, it will just fail.
 *
 * `HEAD` and `OPTIONS` HTTP methods are quite special and low level and rarely
 * used, therefore these are the only 2 methods which do not have wrapper
 * methods to easily create `Fetch` instances from `Builder` instance. However
 * library users can simply use the low level `HTTP` method on `Builder`.
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
  // For the methods below, see JSDoc
  | "HEAD"
  | "OPTIONS";
