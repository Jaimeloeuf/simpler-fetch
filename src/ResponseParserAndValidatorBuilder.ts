import type { Validator, ResponseParser } from "./types";
import type {
  ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder,
  ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder,
} from "./ChainableFetchConfig";
import { ResponseExceptionParserAndValidatorBuilder } from "./ResponseExceptionParserAndValidatorBuilder";
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
    private readonly config: ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder
  ) {}

  #ResponseExceptionParserAndValidatorBuilder<SuccessType>(
    responseParser: ResponseParser<SuccessType>,
    responseValidator?: Validator<SuccessType>
  ) {
    this.config.responseParser = responseParser;
    this.config.responseValidator = responseValidator;
    return new ResponseExceptionParserAndValidatorBuilder<SuccessType>(
      this
        .config as ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder
    );
  }

  /**
   * Parse `fetch` response as text using `res => res.text()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsText(responseValidator?: Validator<string>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<string>(
      (res) => res.text(),
      responseValidator
    );
  }

  /**
   * Parse `fetch` response as text using `(res) => res.blob()`.
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
   * Parse `fetch` response as text using `(res) => res.formData()`.
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
   * Parse `fetch` response as text using `(res) => res.arrayBuffer()`.
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
   * Parse `fetch` response as text using `(res) => res.json()`.
   *
   * You can optionally set a validator to validate that the response result is
   * correct at runtime.
   */
  parseResponseAsJson<jsonData = any>(responseValidator?: Validator<jsonData>) {
    return this.#ResponseExceptionParserAndValidatorBuilder<jsonData>(
      jsonParser,
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
