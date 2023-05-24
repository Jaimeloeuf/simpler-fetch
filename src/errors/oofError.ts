/**
 * Custom named error class so that library users can check for this failure
 * mode with the `instanceof` operator.
 *
 * This error will be exclusively by the `oof` class when there is an error,
 * usually caused by configuration issues.
 *
 * Note that this error will not be returned by the API call, instead this will
 * be an error ***thrown***! This is thrown to give high visibility to the issue
 * since this is a library user error and not a network/API call related error.
 */
export class oofError extends Error {}
