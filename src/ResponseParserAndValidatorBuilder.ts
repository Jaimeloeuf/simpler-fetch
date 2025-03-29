import type { Validator, ResponseParser } from "./types";
import type { ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder } from "./ChainableFetchConfig";
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
    private readonly chainableFetchConfig: ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder
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
