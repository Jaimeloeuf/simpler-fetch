import { ExpectedFetchConfig } from "./ExpectedFetchConfig";

export type ExpectedFetchConfig_for_ResponseExceptionParserAndValidatorBuilder =
  ExpectedFetchConfig<
    | "url"
    | "path"
    | "method"
    | "defaultOptions"
    | "defaultHeaders"
    | "body"
    | "responseParser"
  >;
