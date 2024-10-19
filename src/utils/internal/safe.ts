import type { RequestException } from "../../types";

/**
 * This function wraps any given function to prevent exceptions from bubbling up
 * by returning either the result of the function call or an exception if
 * any is thrown, encapsulating both in a tuple that can be destructured.
 *
 * The return type's tuple order is always [err|null, res|null], always error
 * first, value second, so users are forced to check for errors first.
 *
 * ### About
 * Function wrapper to ensure that any of the `run` methods will not throw /
 * bubble up any exceptions to library users. Instead all values and exceptions
 * will be encapsulated into a monadic like structure for user to destructure.
 * This takes inspiration from how Go-lang does error handling, where they deal
 * with errors as any other regular returned value sequentially, without having
 * to deal with jumping control flows with try/catch blocks.
 *
 * Go-lang error handling reference: https://go.dev/blog/error-handling-and-go
 *
 * This function gives 'run' methods a stricter type signature so that it will
 * be more ergonomic for library users when using this library with TypeScript,
 * as the new type signature will help with type narrowing operations, as
 * narrowing the type of one of the return value also narrows the other value's
 * type. I.e. narrowing the `err` type to null will also narrow the `res` type
 * to be not null, effectively only requiring the users to do type narrowing
 * once rather than twice.
 *
 * ### Why not use an opaque type for return type signature?
 * ```typescript
 * type Success<T> = [null, T];
 * type Failed = [Error, null];
 * type WrappedResponse<T> = Success<T> | Failed;
 *
 * const safe = <T>(fn: () => Promise<T>): Promise<WrappedResponse<T>> =>
 *   fn()
 *     .then((res) => [null, res])
 *     .catch((err) => [err, null]);
 * ```
 * Why can't the code be written like this to use an opaque type for the return
 * type so that it reads off nicely rather than explicitly defining the return
 * type in the function's type signature?
 *
 * Because Opaque types, although better worded and more descriptive to read, is
 * opaque by nature (cannot see the actual type notation) which means that it is
 * harder for users to actually read and understand with one glance what the
 * return type actually is. They would have to look up the definition of the
 * `WrappedResponse` type before they can fully understand how to use it.
 * Therefore to ensure that library users have as little context switch as
 * possible, the type definition is written in the function signature directly.
 */
export const safe = <T>(
  fn: () => Promise<T>
): Promise<readonly [null, T] | readonly [RequestException, null]> =>
  fn()
    .then((res) => [null, res] as const)
    .catch((err) => [err, null] as const);
