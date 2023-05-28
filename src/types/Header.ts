/**
 * `HeaderValue` type represents what can be used to add HTTP header values.
 * This type follows the `headers` type required by the fetch API itself.
 *
 * Note that this is NOT A JSON stringifiable type, since headers for the fetch
 * API do not accept arbitrary objects.
 *
 * Exporting this type so that you can explicitly type your Header objects
 * with this to ensure that it is correctly typed at point of value definition
 * instead of only type checking when you call the `.header` method.
 *
 * Note that although traditionally primitive values like numbers and boolean
 * were allowed, it is only because they were implicitly converted to strings
 * before they were sent out, as the HTTP spec requires header values to be
 * strings. Thus this stricter type makes it more obvious and enforces it at the
 * user level.
 *
 * https://stackoverflow.com/questions/34152142/possible-types-of-a-http-header-value
 */
export type HeaderValue = Exclude<HeadersInit, Headers>;

/**
 * ## `Header` Type
 * Header can either be,
 * 1. A `HeaderValue`.
 * 2. A function that returns a `HeaderValue` or undefined.
 * 3. A function that returns a Promise that resolves to `HeaderValue` or
 * undefined.
 *
 * Header cannot be `undefined` directly because the `header` method cannot be
 * directly called with `undefined` because that wouldn't make any sense.
 *
 * Exporting this type so that library users can explicitly type Header values
 * with this to ensure that it is correctly typed at point of value definition
 * instead of only type checking when you call the `.header` method.
 *
 * ## `Header` function types
 * The function types can return undefined instead of a `HeaderValue` because
 * the API call should still run even if the header cannot be generated. For
 * e.g. if using a function that reads auth token from local storage and only
 * return a `HeaderValue` with the token if it exists. This will not cause any
 * errors because spreading `undefined` into an object will just do nothing
 * `{ something: true, ...undefined }` will just be `{ something: true }`
 *
 * If function throws, the API call will be cancelled and the exception will be
 * caught by the `safe` function wrapper before they are bubbled up and returned
 * to the library user.
 */
export type Header =
  | HeaderValue
  | (() => HeaderValue | undefined)
  | (() => Promise<HeaderValue | undefined>);
