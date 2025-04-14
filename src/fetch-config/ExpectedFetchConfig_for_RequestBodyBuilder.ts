import { ExpectedFetchConfig } from "./ExpectedFetchConfig";

export type ExpectedFetchConfig_for_RequestBodyBuilder = ExpectedFetchConfig<
  "method" | "url" | "defaultOptions" | "defaultHeaders" | "path"
>;
