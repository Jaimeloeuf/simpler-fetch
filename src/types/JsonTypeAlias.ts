/**
 * `JsonResponse` is an alias for the `any` type because JSON parsing and
 * stringification can support virtually any type.
 */
export type JsonTypeAlias = any;

/**
 * `JsonResponse` is an alias for the `any` type because it follows the return
 * type of `ResponseBody.json()` which returns `any`. So there is no point in
 * making this a stricter type if the type is going to be widened later on in
 * the actual parsing since that would override this.
 */
export type JsonResponse = JsonTypeAlias;
