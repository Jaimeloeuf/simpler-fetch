import type {
  ExpectedFetchConfig_for_RequestBodyBuilder,
  ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder,
} from "./fetch-config";
import type { JsonTypeAlias } from "./types";

import { ResponseParserAndValidatorBuilder } from "./ResponseParserAndValidatorBuilder";

/**
 * Builder pattern class for users to set request body.
 */
export class RequestBodyBuilder {
  constructor(
    private readonly config: ExpectedFetchConfig_for_RequestBodyBuilder
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
   * In the example below, TS will enforce that `myValue` is `FormDataType`
   * ```typescript
   * .setRequestBody<FormDataType>(myValue)
   * ```
   *
   * For TS users, the body type is a generic type variable even though its
   * default type for it is `any` so that you can use it to restrict the type
   * passed into the method. This allows you to enforce type safety where once a
   * generic type is set, you know that the value passed in for the `body`
   * parameter cannot be any other type.
   *
   * ### On why is optionalContentType optional
   * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#body
   * Quoting the last line: "... the fetch() function will try to intelligently
   * determine the content type. A request will automatically set a Content-Type
   * header if none is set in the dictionary." This means that if none is passed
   * in, fetch API's implementation will guess and set the content-type
   * automatically, which is why this parameter is optional.
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
    this.config.body = body;
    this.config.optionalContentType = optionalContentType;
    return new ResponseParserAndValidatorBuilder(
      this.config as ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder
    );
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
   * Even though there is no default argument, you do not have to call this
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
   * In the example below, TS will enforce that `val` is `ReqBodyType`
   * ```typescript
   * .setRequestBodyWithJsonData<ReqBodyType>(val)
   * ```
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
    // Content-type must be set manually even though `fetch` can guess most
    // content-type, because once `data` is stringified, the data is string type
    // and fetch will assume it is 'text/plain' rather than 'application/json'.
    return this.setRequestBody(JSON.stringify(data), "application/json");
  }

  /**
   * If API request has no request body. Only applicable for HTTP Methods other
   * than HEAD/GET since these 2 methods do not support request body by default.
   */
  noRequestBody() {
    return this.setRequestBody(undefined);
  }
}
