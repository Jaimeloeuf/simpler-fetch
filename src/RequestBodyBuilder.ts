import type { JsonTypeAlias } from "./types";
import type {
  ExpectedFetchConfig_for_RequestBodyBuilder,
  ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder,
} from "./ChainableFetchConfig";
import { ResponseParserAndValidatorBuilder } from "./ResponseParserAndValidatorBuilder";

/**
 * Builder pattern class for users to set request body.
 */
export class RequestBodyBuilder {
  /**
   * Low level constructor API that should not be used by library users.
   */
  constructor(
    private readonly chainableFetchConfig: ExpectedFetchConfig_for_RequestBodyBuilder
  ) {}

  /**
   * Set request body to be sent to server for HTTP methods such as POST/PUT.
   *
   * ### When to use this method?
   * For most users who want to send JSON data to the server, see the
   * `setRequestBodyWithJsonData` method instead. For other types of data like
   * `FormData`, `Blob`, `streams` just pass it into this method as the `body`
   * parameter and the content type will be automatically detected / set by the
   * native `fetch` function.
   *
   * ### Why have both `setRequestBody` and `setRequestBodyWithJsonData` method?
   * The reason for this method instead of just having
   * `setRequestBodyWithJsonData` only is because the library cannot always just
   * assume that library users only use JSON data, and have to support data
   * types like FormData, Blob and etc... However the problem is that when
   * content-type is not set, `fetch` will try to guess it, but when body is the
   * results of `JSON.stringify(this.#body)`, fetch will guess the content-type
   * to be text/plain and the browser will treat it as a safe CORS request,
   * which means that for that request there will be no pre-flight request sent.
   * Which means that the browser prevents certain headers from being used,
   * which might cause issues, and also the server may not always respond
   * correctly because they assume they got text/plain even though your API
   * endpoint is for application/json.
   *
   * The type of `body` value can be anything, as you can pass in any value that
   * the `fetch` API's `RequestInit`'s body property accepts.
   *
   * ### Using generics for TS Type Safety
   * ```typescript
   * const [err, res] = await sf
   *   .useDefaultBaseUrl()
   *   .POST("/api")
   *   .setRequestBody<FormData>(myValue) // TS will enforce that myValue is FormData
   *   .runJSON();
   * ```
   * The above code sets the body type for type safety.
   *
   * For TS users, the body type is a generic type variable even though its
   * default type for it is `any` so that you can use it to restrict the type
   * passed into the method. This allows you to enforce type safety where once a
   * generic type is set, you know that the value passed in for the `body`
   * parameter cannot be any other type.
   *
   * ### On `optionalContentType`'s type safety
   * Note on `optionalContentType`'s type: Although it is possible to create a
   * union type of all allowed string literals for the content-type header /
   * mime types, it is not very feasible as it is a very big list that will be
   * updated in the future. Therefore users are expected to make sure that any
   * string they pass is valid.
   * References on all supported content-type values:
   * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
   * - https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header/48704300#48704300
   * - https://www.iana.org/assignments/media-types/media-types.xhtml
   *
   * @returns Returns the current instance to let you chain method calls
   */
  setRequestBody<RequestBodyType = any>(
    body: RequestBodyType,
    optionalContentType?: string
  ) {
  }

  /**
   * This method stringifies a JSON stringifiable data type to use as the
   * request body, and sets the content-type to 'application/json'.
   *
   * ### What data type can be passed in?
   * Any JS value that can be JSON serialized with `JSON.stringify()`. See the
   * link on what type of data can be used.
   * [MDN link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description)
   *
   * ### What if you have no data to send?
   * Even though there is no default arguement, you do not have to call this
   * method with an empty object when using a method like `POST` as `fetch` and
   * API services will just treat it as an empty object by default.
   *
   * ### Why not just use the `setRequestBody` method?
   * Since JSON is the most popular methods of communication over HTTP, this
   * method helps users to write less code by stringifying their JS object and
   * setting content-type header to 'application/json', instead of requiring
   * library users to write `.setRequestBody(JSON.stringify(data), "application/json")`
   * every single time they want to send JSON data to their API servers.
   * This also allows library users to specify type of data object using the
   * method generic for type checking.
   *
   * ### Using generics for TS Type Safety
   * ```typescript
   * const [err, res] = await sf
   *   .POST("/api")
   *   // TS will enforce that val must be ReqBodyType
   *   .setRequestBodyWithJsonData<ReqBodyType>(val)
   *   .run();
   * ```
   * The above code sets the body type for type safety.
   *
   * For TS users, the data parameter is a generic type even though its default
   * type is `any` so that you can use it to restrict the type passed into the
   * method. This allows you to enforce type safety where once a generic type is
   * set, you know that the value passed in for the `body` parameter cannot be
   * any other type.
   *
   * @returns Returns the current instance to let you chain method calls
   */
  setRequestBodyWithJsonData<JsonRequestBodyType = JsonTypeAlias>(
    /**
     * Any data type that is of 'application/json' type and can be stringified
     * by `JSON.stringify`.
     */
    data: JsonRequestBodyType
  ) {
    // Content-type needs to be set manually even though `fetch` is able to
    // guess most content-type, because once object is stringified, the data
    // will be a string and fetch will guess that it is 'text/plain' rather than
    // 'application/json'.
    return this.setRequestBody(JSON.stringify(data), "application/json");
  }

  /**
   * If the API request has no request body
   */
  noRequestBody() {
    return this.setRequestBody(undefined);
  }
}
