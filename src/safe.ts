import type { RequestError } from "./types/index";

/**
 * @param fn Takes in any function to wrap around to prevent errors from bubbling up
 * @returns Returns either the result of the function call or an error if any is thrown, encapsulating both in an object that can be destructured
 *
 * ### About
 * Function wrapper to ensure that any of the `run` methods will not throw/bubble up any errors to the users,
 * instead all values and errors will be encapsulated into a monadic like structure for user to destructure out.
 * This takes inspiration from how Go-lang does error handling, where they can deal with errors sequentially,
 * without having to deal with jumping control flows with try/catch blocks.
 *
 * Go-lang error handling reference: https://go.dev/blog/error-handling-and-go
 *
 * This function gives 'run' methods a stricter type signature so that it will be more ergonomic for users when
 * using this library with TypeScript, as the new type signature will help with type narrowing operations, as
 * narrowing the type of one of the return value also narrows the other value's type. I.e. narrowing the 'err'
 * type to undefined will also narrow the 'res' type to be not undefined, effectively only requiring the users
 * to do type narrowing once rather than twice.
 *
 * This function's return type is generically typed using the return type of the `fn` parameter.
 *
 * The return type is manually/explicitly typed which is different from the TS inferred type signature, because
 * if `err: undefined` and `res: undefined` are not explicitly written in the return objects of the 2 methods,
 * TS will infer the return type to be a union of the types `{ res }` and `{ err }`. This is different from the
 * explicit type signature given, which says that every return object value will have both properties `{ res, err }`
 * defined even if one of the values is `undefined`. The problem with the inferred return type is that TS library
 * users cannot write code that allows them to destructure both values out first before using them like `const { res,
 * err } = await oof.GET("/api").run()`, which is kind of the main style that this library encourages users to use
 * because TS will complain that the user is trying to destructure a property that does not exist on the object. Even
 * though the value does not exist as what TS suggests, accessing an unknown property on an object produces the value
 * `undefined` anyways.
 *
 *
 * ### Why is `@ts-ignore` used?
 * Although this type signature provides strong type safety, to implement this type signature properly would mean
 * that the code (and by extension the build output) will be longer because the function would need to hardcode
 * the props that are undefined. This is unnecessary because in JS, any prop that isn't defined on an object will
 * have 'undefined' as its value when you try to access it by destructuring it out. Therefore the `ts-ignore` flag
 * is used to ignore the error of missing 'undefined' props to reduce library size while not affecting its usage.
 *
 * Implementation without using the `ts-ignore` flag
 * ```typescript
 * const safe = <T>(
 *   fn: () => Promise<T>
 * ): Promise<{ res: T; err: undefined } | { res: undefined; err: Error }> =>
 *    fn()
 *      .then((res) => ({ res, err: undefined })) // Hardcoded undefined required
 *      .catch((err) => ({ err, res: undefined })); // Hardcoded undefined required
 * ```
 *
 *
 * ### Why can't the return type be inferred?
 * ```typescript
 * const safe = async <T>(fn: () => Promise<T>) =>
 *   fn()
 *     .then((res) => ({ res }))
 *     .catch((err) => ({ err }));
 * ```
 * Why can't the code be written like this and let TS infer the return type?
 *
 * Because the inferred type will be a union type of `{res} | {err}`, which means that if the user attempts to write
 * `{ res, err }` to destructure out the values, it will result in an error, because TS thinks that the return type
 * will either be `{res}` or `{err}` only without letting the other counterpart be destructured to undefined unless
 * explicitly annotated.
 *
 *
 * ### Why not use an opaque type?
 * ```typescript
 * type Success<T> = { res: T; err: undefined };
 * type Failed = { res: undefined; err: Error };
 * type WrappedResponse<T> = Success<T> | Failed;
 *
 * const safe = <T>(fn: () => Promise<T>): Promise<WrappedResponse<T>> =>
 *   fn()
 *     .then((res) => ({ res, err: undefined }))
 *     .catch((err) => ({ err, res: undefined }));
 * ```
 * Why can't the code be written like this to use an opaque type for the return type so that it reads off nicely
 * rather than explicitly defining the return type in the function's type signature?
 *
 * Because Opaque types, although better worded and more descriptive to read, is opaque by nature (cannot see the
 * actual type notation) which means that it is harder for users to actually read and understand with one glance
 * what the return type actually is. They would have to look up the definition of the `WrappedResponse` type before
 * they can fully understand how to use it. Therefore to ensure that library users have as little context switch as
 * possible, the type definition is written in the function signature directly.
 */
export const safe = <T>(
  fn: () => Promise<T>
): Promise<
  { res: T; err: undefined } | { res: undefined; err: RequestError }
> =>
  // @ts-ignore See the JSDoc on why this is used
  fn()
    .then((res) => ({ res }))
    .catch((err) => ({ err }));
