import type { Validator, ResponseParser } from "./types";
import type {
  ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder,
  ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder,
} from "./fetch-config";
import { ResponseExceptionParserAndValidatorBuilder } from "./ResponseExceptionParserAndValidatorBuilder";

/**
 * Builder pattern class for users to set response parser and response's
 * optional validator.
 */
export class ResponseParserAndValidatorBuilder {
  /**
   * Low level constructor API that should not be used by library users.
   */
  constructor(
    private readonly config: ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder
  ) {}

  #ResponseExceptionParserAndValidatorBuilder<ResponseDataType>(
    responseParser: ResponseParser<ResponseDataType>,
    responseValidator?: Validator<ResponseDataType>
  ) {
    this.config.responseParser = responseParser;
    this.config.responseValidator = responseValidator;
    return new ResponseExceptionParserAndValidatorBuilder<ResponseDataType>(
      this
        .config as ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder
    );
  }

  /**
   * Parse `fetch` response as string using `res => res.text()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsText<const T extends string = string>(
    responseValidator?: Validator<T>
  ) {
    return this.#ResponseExceptionParserAndValidatorBuilder<T>(
      // @todo There is probably a better way for this
      (res) => res.text() as any as Promise<T>,
      responseValidator
    );
  }

  /**
   * Parse `fetch` response as Blob using `(res) => res.blob()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsBlob(responseValidator?: Validator<Blob>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<Blob>(
      (res) => res.blob(),
      responseValidator
    );
  }

  /**
   * Parse `fetch` response as FormData using `(res) => res.formData()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsFormData(responseValidator?: Validator<FormData>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<FormData>(
      (res) => res.formData(),
      responseValidator
    );
  }

  /**
   * Parse `fetch` response as ArrayBuffer using `(res) => res.arrayBuffer()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsArrayBuffer(responseValidator?: Validator<ArrayBuffer>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<ArrayBuffer>(
      (res) => res.arrayBuffer(),
      responseValidator
    );
  }

  /**
   * Parse `fetch` response as JsonResponse using `(res) => res.json()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsJson<JsonResponse = any>(
    responseValidator?: Validator<JsonResponse>
  ) {
    return this.#ResponseExceptionParserAndValidatorBuilder<JsonResponse>(
      (res) => res.json(),
      responseValidator
    );
  }

  /**
   * Dont parse response.
   *
   * Use this if you dont care about the response at all, for example if you
   * just want to trigger a fire and forget API call and ignore the response.
   */
  dontParseResponse() {
    return this.#ResponseExceptionParserAndValidatorBuilder(
      async (_res) => undefined
    );
  }
}
