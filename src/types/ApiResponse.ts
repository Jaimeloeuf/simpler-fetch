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
};
