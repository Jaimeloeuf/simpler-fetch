import type { TimeoutError, HeaderError, ValidationError } from "../errors";

/**
 * Union type for all possible errors that can be **returned** from an API call.
 * This covers all possible errors from network failure to errors thrown from
 * header function(s), to runtime response validation failure.
 *
 * Basically this is the type of the error that can be returned from the API
 * call safely.
 * ```typescript
 * const { res, err } = ... --> API call
 *
 * err; --> This `err` is `RequestError` type
 * ```
 *
 * This does not include the `oofError` type since that will be **thrown** and
 * not returned when the oof library is not correctly configured / used.
 *
 * See this reference on all errors that can be thrown by the `fetch` API itself
 * https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
 */
export type RequestError =
  // AbortError caused by custom timeouts
  | DOMException

  // If the network / API call itself fails
  | TypeError

  // Custom error returned when API call exceeds custom timeout limit.
  | TimeoutError

  // Custom error returned when a Header function throws an error.
  | HeaderError

  // Custom error returned when response fails runtime response validation.
  | ValidationError;
