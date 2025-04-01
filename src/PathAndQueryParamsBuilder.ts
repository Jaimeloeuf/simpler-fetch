import type { HTTPMethod } from "./types";
import type {
  ExpectedFetchConfig_for_PathBuilder,
  ExpectedFetchConfig_for_RequestBodyBuilder,
  ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder,
} from "./ChainableFetchConfig";
import { RequestBodyBuilder } from "./RequestBodyBuilder";
import { ResponseParserAndValidatorBuilder } from "./ResponseParserAndValidatorBuilder";

/**
 * Builder pattern class for users to set their API path and URL query params.
 */
export class PathAndQueryParamsBuilder<
  const HTTPMethodUsed extends HTTPMethod,
  const ReturnedBuilder extends HTTPMethodUsed extends "GET" | "HEAD"
    ? ResponseParserAndValidatorBuilder
    : RequestBodyBuilder = HTTPMethodUsed extends "GET" | "HEAD"
    ? ResponseParserAndValidatorBuilder
    : RequestBodyBuilder
> {
  constructor(private readonly config: ExpectedFetchConfig_for_PathBuilder) {}

  path(path: string) {
    return this.pathWithQueryParams(path, undefined);
  }

  pathWithQueryParams<
    QueryParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >
  >(path: string, queryParams?: QueryParams): ReturnedBuilder {
    this.config.path = path;

    if (queryParams !== undefined) {
      // Remove all undefined values so that the default type can accept optional
      // values without having undefined be in the final generated query params.
      Object.keys(queryParams).forEach(
        (key) => queryParams[key] === undefined && delete queryParams[key]
      );

      // Type cast needed here since TSC cannot infer the removal of undefined
      // values from the Record type.
      this.config.queryParams = queryParams as Record<string, string>;
    }

    return this.config.method in ["GET", "HEAD"]
      ? (new ResponseParserAndValidatorBuilder(
          this
            .config as ExpectedFetchConfig_for_ResponseParserAndValidatorBuilder
        ) as ReturnedBuilder)
      : (new RequestBodyBuilder(
          this.config as ExpectedFetchConfig_for_RequestBodyBuilder
        ) as ReturnedBuilder);
  }
}
