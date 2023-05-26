/**
 * Custom named error class so that library users can check for this failure
 * mode with the `instanceof` operator.
 *
 * This error will be used when the API call's response data fails runtime
 * response validation with the custom validator the library user passed in.
 * This will only be thrown if the validator returned false and did not throw an
 * error. In the case where the Validator throws an error, that error will be
 * returned to the library user instead of this.
 *
 * ## Potential add on
 * Potentially, the error name can be changed to the class name so that if
 * library users ever log the error out, the `error.toString()` method will use
 * the custom error name as part of the string, which can help users with
 * debugging it by looking at the error name instead of just having it use the
 * generic `Error` name. However weighing this usefulness against library size,
 * it is better to have a smaller library since this is not a need to have
 * feature as library users should already be using `instanceof` operator to
 * check error type in the first place.
 *
 * Example
 * ```typescript
 * export class ValidationError extends Error {
 *   constructor(message: string) {
 *     super(message);
 *     this.name = "ValidationError";
 *   }
 * }
 * ```
 */
export class ValidationError extends Error {}
