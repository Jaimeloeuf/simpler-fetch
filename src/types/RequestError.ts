import type { TimeoutError, HeaderError, ValidationError } from "../errors";

/**
 * Union type for all 'simpler-fetch' defined errors that can be **returned**
 * from an API call. This covers all possible errors from network failure to
 * errors thrown from header function(s), to runtime response validation failure
 * where these are standard expected errors.
 *
 * Basically this is the type of the error that can be returned from the API
 * call safely.
 * ```typescript
 * const { res, err } = ... --> API call
 *
 * err; --> This `err` is `RequestError` type
 * ```
 *
 * ## Errors not included
 * However there are some error types that are not part of this union,
 * specifically `oofError` and library user defined errors.
 *
 * 1. This does not include the `oofError` type since that will be **thrown**
 * and not returned when the oof library is not correctly configured / used.
 *
 * 2. When doing runtime response validation, if the validator throws a custom
 * error type, e.g. user uses 'zod' and it throws a `ZodError`, this union type
 * will obviously not include that. However despite that, library users can
 * still check for that error type using `err instanceof ZodError` in a type
 * safe manner, since instanceof operator can be used for narrowing even when
 * it is not defined on the union type itself.
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
