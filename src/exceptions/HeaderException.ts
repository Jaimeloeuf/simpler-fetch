/**
 * Custom named exception class so that library users can check for this failure
 * mode with the `instanceof` operator.
 *
 * This exception is used when there is an exception thrown during Header
 * generation process right before the API call. In `Fetch.#fetch` method,
 * header values are generated, where functions and async functions are accepted
 * as header values to generate header objects right before the API call. Any
 * exceptions thrown are caught, and wrapped with this `HeaderException` type
 * before being returned to the library user.
 *
 * ## Why wrap the original exception?
 * Since these functions can throw any possible exception types, it is hard for
 * library users to pin down the exact cause of the exception using `instanceof`
 * operator, especially so when the header generation function they use is not
 * authored by them and can throw arbitrary exception types (e.g. using an auth
 * library and that throws some custom exception).
 *
 * By wrapping it in this `HeaderException` Error object type, the library user
 * can easily determine that header generation is what caused the exception with
 * a `instanceof` check. If the user would like to drill down on the specifics,
 * they can continue to do so as the original exception thrown is kept on the
 * `error` property of the `HeaderException` instance. Use `instanceof` operator
 * on `HeaderException.error` to continue type narrowing down the root cause.
 *
 * Example of drilling down on the root cause
 * ```typescript
 * class MyCustomError extends Error {}
 *
 * const [err, res] = await sf
 *     .useFullUrl("https://example.com/test")
 *     .GET()
 *     .useHeader(async () => { throw new MyCustomError("some failure"); })
 *     .runJSON();
 *
 * if (err instanceof HeaderException && err.error instanceof MyCustomError) {
 *      console.log("API call failed as Header function threw MyCustomError");
 * }
 * ```
 */
export class HeaderException extends Error {
  constructor(
    /**
     * The original exception thrown during the header generation process. This
     * is stored so that library users can use this to check root cause of the
     * issue using the `instanceof` operator.
     */
    public readonly error: Error
  ) {
    // Use the original error message without any modifications
    super(error.message);
  }
}
