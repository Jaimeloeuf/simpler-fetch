/**
 * Custom named exception class so that library users can check for this failure
 * mode with the `instanceof` operator.
 *
 * This exception will be thrown when there is a custom timeout value set, and
 * the API did not respond before the time.
 */
export class TimeoutException extends Error {}
