import type { Header, HTTPMethod, Validator, ResponseParser } from "./types";

export type ChainableFetchConfig = {
  /**
   * This is the base URL
   */
  url?: string;

  /**
   * Path string that will be combined with the base URL later
   */
  path?: string;

  /**
   * URL Query Params
   */
  queryParams?: Record<string, string>;

  /**
   * API call's HTTP Method
   */
  method?: HTTPMethod;

  /**
   * Instance variable to hold the default `RequestInit` options object for the
   * specified base url, which is only used if the library user chooses to use
   * the default options object using the `useDefaultOptions` method.
   */
  defaultOptions?: RequestInit;

  /**
   * Instance variable to hold the default `headers` array for the specified
   * base Url, which is only used if the library user chooses to use the default
   * headers using the `useDefaultHeaders` method.
   *
   * This is not `readonly` since this will be reset to an empty array after
   * calling `useDefaultHeaders` method to keep the method indempotent.
   */
  defaultHeaders?: Array<Header>;

  /**
   * `RequestInit` type options passed to the `fetch` function.
   */
  options: RequestInit;

  /**
   * An array of `Header` to be reduced into a single Headers object before
   * being used in this instance's API call.
   */
  headers: Array<Header>;

  /**
   * Optional `AbortController` used for custom timeouts.
   */
  abortController?: AbortController;

  /**
   * Optional timeout milliseconds for custom timeouts.
   */
  timeoutInMilliseconds?: number;

  /**
   * The `body` field will be used for the `body` property of `fetch` call.
   *
   * Due to the huge variety of argument types accepted by `BodyInit | null` and
   * the lack of a standard TypeScript interface/type describing it, this is
   * explicitly typed as `any`, which means that this type is basically anything
   *  that can be serialized by JSON.stringify and also any child types of
   * `BodyInit | null`.
   *
   * References:
   * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
   * - https://tc39.es/ecma262/#sec-json.stringify
   */
  body?: any;

  optionalContentType?: string;

  responseParser?: ResponseParser<unknown>;

  responseExceptionParser?: ResponseParser<unknown>;

  responseValidator?: Validator<unknown> | undefined;

  responseExceptionValidator?: Validator<unknown> | undefined;
};

type ExpectedFetchConfig<NonOptionalFields extends keyof ChainableFetchConfig> =
  ChainableFetchConfig & {
    [K in NonOptionalFields]-?: Exclude<ChainableFetchConfig[K], undefined>;
  };

export type ExpectedFetchConfig_for_UrlBuilder = ExpectedFetchConfig<"method">;

export type ExpectedFetchConfig_for_PathBuilder = ExpectedFetchConfig<
  "method" | "url"
>;

export type ExpectedFetchConfig_for_RequestBodyBuilder = ExpectedFetchConfig<
  "url" | "path" | "method" | "defaultOptions" | "defaultHeaders"
>;

export type ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder =
  ExpectedFetchConfig<
    "url" | "path" | "method" | "defaultOptions" | "defaultHeaders" | "body"
  >;

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
