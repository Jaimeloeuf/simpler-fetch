import { ExpectedFetchConfig } from "./ExpectedFetchConfig";

export type ExpectedFetchConfig_for_OtherFetchConfigBuilder =
  ExpectedFetchConfig<
    | "url"
    | "path"
    | "method"
    | "defaultOptions"
    | "defaultHeaders"
    | "body"
    | "responseParser"
    | "responseExceptionParser"
  >;
