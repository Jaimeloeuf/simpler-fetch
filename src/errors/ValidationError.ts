/**
 * Custom named error class so that library users can check
 * for this failure mode with the `instanceof` operator.
 *
 * This error will be used when the API call's response data
 * fails runtime response validation with the custom validator
 * the library user passed in. This will only be thrown if the
 * validator returned false and did not throw an error. In the
 * case where the Validator throws an error, that error will
 * be returned to the library user instead of this.
 */
export class ValidationError extends Error {}
