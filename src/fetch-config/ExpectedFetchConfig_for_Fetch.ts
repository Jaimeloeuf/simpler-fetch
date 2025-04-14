import { ExpectedFetchConfig } from "./ExpectedFetchConfig";

export type ExpectedFetchConfig_for_Fetch = ExpectedFetchConfig<
  | "url"
  | "path"
  | "method"
  | "defaultOptions"
  | "defaultHeaders"
  | "body"
  | "responseParser"
  | "responseExceptionParser"
>;
