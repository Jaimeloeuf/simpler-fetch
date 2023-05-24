/**
 * Unifying all possible errors that can be thrown by fetch into a single error
 * type, covering possible errors thrown by header function(s) too with the
 * generic `Error` class.
 *
 * See this reference on all errors that can be thrown:
 * https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
 *
 * RequestError is exported from the library so that users can inspect this
 * union type.
 */
export type RequestError =
  // AbortError
  | DOMException
  // If the network fails
  | TypeError
  // Generic Error type for when the header function throws....?
  | Error;
