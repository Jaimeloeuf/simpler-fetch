import type { Validator, ResponseParser } from "./types";
import type {
  ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder,
  ExpectedFetchConfig_for_OtherFetchConfigBuilder,
} from "./ChainableFetchConfig";
import { OtherFetchConfigBuilder } from "./OtherFetchConfigBuilder";

/**
 * Builder pattern class for users to set response parser and response's
 * optional validator.
 */
export class ResponseExceptionParserAndValidatorBuilder<ResponseDataType> {
  /**
   * Low level constructor API that should not be used by library users.
   */
  constructor(
    private readonly config: ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder
  ) {}

  #CreateFetch<ResponseExceptionDataType>(
    responseExceptionParser: ResponseParser<ResponseExceptionDataType>,
    responseExceptionValidator?: Validator<ResponseExceptionDataType>
  ) {
    this.config.responseExceptionParser = responseExceptionParser;
    this.config.responseExceptionValidator = responseExceptionValidator;
    return new OtherFetchConfigBuilder<
      ResponseDataType,
      ResponseExceptionDataType
    >(this.config as ExpectedFetchConfig_for_OtherFetchConfigBuilder);
  }

  /**
   * Parse `fetch` response as string using `res => res.text()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseExceptionAsText<const T extends string = string>(
    responseValidator?: Validator<T>
  ) {
    return this.#CreateFetch<T>(
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
  parseResponseExceptionAsBlob(responseValidator?: Validator<Blob>) {
    return this.#CreateFetch<Blob>((res) => res.blob(), responseValidator);
  }

  /**
   * Parse `fetch` response as FormData using `(res) => res.formData()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseExceptionAsFormData(responseValidator?: Validator<FormData>) {
    return this.#CreateFetch<FormData>(
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
  parseResponseExceptionAsArrayBuffer(
    responseValidator?: Validator<ArrayBuffer>
  ) {
    return this.#CreateFetch<ArrayBuffer>(
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
  parseResponseExceptionAsJson<JsonResponse = any>(
    responseValidator?: Validator<JsonResponse>
  ) {
    return this.#CreateFetch<JsonResponse>(
      (res) => res.json(),
      responseValidator
    );
  }

  /**
   * Dont parse response exception.
   *
   * Use this if you dont care about the response at all, for example if you
   * just want to trigger a fire and forget API call and ignore the response.
   */
  dontParseResponseException() {
    return this.#CreateFetch(async (_res) => undefined);
  }
}
