/**
 * Type of a generic type predicate, used for response validation.
 */
export type Validator<T> = (data: unknown) => data is T;
