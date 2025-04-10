/**
 * Expected return type of all `Fetch` run methods that do response parsing.
 *
 * Use satisfies to typecheck, to ensure that the return type will not be
 * generalized into the opaque `ApiResponse<T>` where users would not be able
 * to see the shape of the returned data clearly.
 */
export type ApiResponse<T> = {
  ok: boolean;
  status: Response["status"];
  headers: Response["headers"];
  data: T;

  /**
   * The raw `Response` type to serve as an escape hatch for user who wants to
   * access this while still having the benefits of the library.
   */
  rawResponse: Response;
};
