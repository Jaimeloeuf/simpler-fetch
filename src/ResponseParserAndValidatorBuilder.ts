import type { Header, HTTPMethod, Validator, ResponseParser } from "./types";
import { jsonParser } from "./utils";

/**
 * Builder pattern class for users to set response parser and response's
 * optional validator.
 */
export class ResponseParserAndValidatorBuilder {
  /**
   * Low level constructor API that should not be used by library users.
   */
  constructor(
    /**
     * API call's HTTP Method
     */
    private readonly method: HTTPMethod,

    /**
     * ### Warning
     * This should not be accessed directly, use `getUrl` method instead.
     *
     * This is the full URL path of the API endpoint to make the request, which
     * can either be a relative or absolute URL path accepted by `fetch`. Note
     * that this may not contain all the Query Params yet since users can set
     * more with `useQuery` method instead of setting it all as strings in path.
     */
    private readonly url: string,

    /**
     * Instance variable to hold the default `RequestInit` options object for the
     * specified base url, which is only used if the library user chooses to use
     * the default options object using the `useDefaultOptions` method.
     */
    private readonly defaultOptions: RequestInit,

    /**
     * Instance variable to hold the default `headers` array for the specified
     * base Url, which is only used if the library user chooses to use the default
     * headers using the `useDefaultHeaders` method.
     *
     * This is not `readonly` since this will be reset to an empty array after
     * calling `useDefaultHeaders` method to keep the method indempotent.
     */
    private readonly defaultHeaders: Array<Header>,

    private readonly body: any,

    private readonly optionalContentType?: string
  ) {}

  #ResponseExceptionParserAndValidatorBuilder<SuccessType>(
    responseParser: ResponseParser<SuccessType>,
    responseValidator?: Validator<SuccessType>
  ) {
  }

  parseResponseAsText(responseValidator?: Validator<string>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<string>(
      (res) => res.text(),
      responseValidator
    );
  }
  parseResponseAsBlob(responseValidator?: Validator<Blob>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<Blob>(
      (res) => res.blob(),
      responseValidator
    );
  }
  parseResponseAsFormData(responseValidator?: Validator<FormData>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<FormData>(
      (res) => res.formData(),
      responseValidator
    );
  }
  parseResponseAsArrayBuffer(responseValidator?: Validator<ArrayBuffer>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<ArrayBuffer>(
      (res) => res.arrayBuffer(),
      responseValidator
    );
  }
  parseResponseAsJson<jsonData = any>(responseValidator?: Validator<jsonData>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<jsonData>(
      jsonParser,
      responseValidator
    );
  }
  parseResponseAsVoid() {
    return this.#ResponseExceptionParserAndValidatorBuilder(
      async (_res) => undefined
    );
  }
}
