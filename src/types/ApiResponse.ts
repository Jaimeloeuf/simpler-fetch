/**
 * Expected data type returned from all `Fetch` run methods that do value extraction.
 *
 * Use satisfies to typecheck, to ensure that the return type will not be generalized
 * into the opaque `ApiResponse<T>` where users would not be able to see the shape of
 * the returned data clearly.
 */
export type ApiResponse<T> = {
  ok: Response["ok"];
  status: Response["status"];
  data: T;
};
