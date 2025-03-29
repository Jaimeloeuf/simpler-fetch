import type { Validator, ResponseParser } from "./types";
import type {
  ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder,
  ExpectedFetchConfig_for_Fetch,
} from "./ChainableFetchConfig";
import { jsonParser } from "./utils";
import { Fetch } from "./NewFetch";

/**
 * Builder pattern class for users to set response parser and response's
 * optional validator.
 */
export class ResponseExceptionParserAndValidatorBuilder<SuccessType> {
  /**
   * Low level constructor API that should not be used by library users.
   */
  constructor(
    private readonly config: ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder
  ) {}

  #CreateFetch<ErrorType>(
    responseExceptionParser: ResponseParser<ErrorType>,
    responseExceptionValidator?: Validator<ErrorType>
  ) {
  }

  parseResponseExceptionAsText(responseValidator?: Validator<string>) {
    return this.#CreateFetch<string>((res) => res.text(), responseValidator);
  }
  parseResponseExceptionAsBlob(responseValidator?: Validator<Blob>) {
    return this.#CreateFetch<Blob>((res) => res.blob(), responseValidator);
  }
  parseResponseExceptionAsFormData(responseValidator?: Validator<FormData>) {
    return this.#CreateFetch<FormData>(
      (res) => res.formData(),
      responseValidator
    );
  }
  parseResponseExceptionAsArrayBuffer(
    responseValidator?: Validator<ArrayBuffer>
  ) {
    return this.#CreateFetch<ArrayBuffer>(
      (res) => res.arrayBuffer(),
      responseValidator
    );
  }
  parseResponseExceptionAsJson<jsonData = any>(
    responseValidator?: Validator<jsonData>
  ) {
    return this.#CreateFetch<jsonData>(jsonParser, responseValidator);
  }
  parseResponseExceptionAsVoid() {
    return this.#CreateFetch(async (_res) => undefined);
  }
}
