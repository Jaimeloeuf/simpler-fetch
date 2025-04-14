import { ExpectedFetchConfig } from "./ExpectedFetchConfig";

export type ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder =
  ExpectedFetchConfig<
    "url" | "path" | "method" | "defaultOptions" | "defaultHeaders" | "body"
  >;
