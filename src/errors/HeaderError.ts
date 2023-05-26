/**
 * Custom named error class so that library users can check for this failure
 * mode with the `instanceof` operator.
 *
 * This error is used when there is an error during the Header generation
 * process right before the API call. In `Fetch.#fetch` method, header values
 * are generated, where functions and async functions are accepted as header
 * values to generate header objects right before the API call. Any errors
 * thrown are caught, and wrapped with this `HeaderError` type before being
 * returned to the library user.
 *
 * ## Why wrap the original error?
 * Since these functions can throw any possible error types, it is hard for
 * library users to pin down the exact cause of the error using the `instanceof`
 * operator, especially so when the header generation function they use is not
 * authored by them and can throw arbitrary error types (e.g. using an auth
 * library and that throws some custom error type).
 *
 * By wrapping it in this `HeaderError` Error object type, the library user can
 * easily determine that the header generation is what caused the error using a
 * `instanceof` check. If the user would like to drill down on the specifics,
 * they can continue to do so as the original error thrown is kept on the
 * `error` property of the `HeaderError` instance. Use `instanceof` operator on
 * `HeaderError.error` to continue type narrowing down the error cause.
 *
 * Example of drilling down on the error cause
 * ```typescript
 * class MyCustomError extends Error {}
 *
 * const { res, err } = await oof
 *     .useOnce("https://example.com/test")
 *     .GET()
 *     .useHeader(async () => { throw new MyCustomError("some failure"); })
 *     .runJSON();
 *
 * if (err instanceof HeaderError && err.error instanceof MyCustomError) {
 *      console.log("API call failed as Header function threw MyCustomError");
 * }
 * ```
 */
export class HeaderError extends Error {
  constructor(
    /**
     * The original error thrown during the header generation process. This is
     * stored so that library users can use this to check exact cause of error
     * using the `instanceof` operator.
     */
    public readonly error: Error
  ) {
    // Keep the same original error message without any modifications
    super(error.message);
  }
}
