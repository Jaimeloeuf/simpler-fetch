import type {
  TimeoutException,
  HeaderException,
  ValidationException,
} from "../exceptions";

/**
 * Union type for all 'simpler-fetch' defined exceptions that could be
 * **returned** from an API call. This covers all possible exceptions from
 * network failure to exceptions thrown from header function(s), to runtime
 * response validation failure.
 *
 * Note that this only applies to exceptions and not errors, where exceptions
 * are error states that are potentially expected, and should be dealt with
 * sequentially as part of a possible state after executing a API call, while
 * errors are unexpected issues that should not have happened at all.
 *
 * Basically this is the exception type that can be returned from the API
 * call safely.
 * ```typescript
 * const { res, err } = ... --> API call
 *
 * err; --> This `err` is `RequestException` type
 * ```
 *
 * ## Errors are not included
 * Error types are not part of this union, specifically `sfError`. `sfError`
 * will be **thrown** and not returned when the library is not correctly
 * configured / used.
 *
 * ## Library user defined exceptions are not included
 * When doing runtime response validation, if the validator throws a custom
 * exception type, e.g. user uses 'zod' and it throws a `ZodError`, this union
 * type will obviously not include that. However despite that, library users can
 * still check for that type using `err instanceof ZodError` in a type safe
 * manner, since instanceof operator can be used for narrowing even when it is
 * not defined on the union type itself.
 *
 * See this reference on all errors that can be thrown by the `fetch` API itself
 * https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
 */
export type RequestException =
  // AbortError on timeout will throw a DOMException error, however there is a
  // possibility that the error can be of DOMException type while not being an
  // 'AbortError', which is why this exception type is still included.
  | DOMException

  // If the network / API call itself fails
  | TypeError

  // Exception returned when API call exceeds custom timeout limit.
  | TimeoutException

  // Exception returned when a Header function throws an error.
  | HeaderException

  // Exception returned when response fails runtime response validation.
  | ValidationException;
