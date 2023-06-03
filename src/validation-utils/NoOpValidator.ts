/**
 * No Op Validator is used when validator function is required but you do not
 * want to provide one because it might not really matter to your use case.
 */
export const NoOpValidator = <T>(_: unknown): _ is T => true;
