import type { ApiResponse } from "../types";

/**
 * Utility function to create a new ApiResponse object that satisfies
 * `ApiResponse<T>`.
 *
 * @param ok Use boolean directly instead of `res.ok` for smaller build output.
 */
export const createApiResponse = <T>(ok: boolean, res: Response, data: T) =>
  ({
    ok,
    status: res.status,
    headers: res.headers,
    data,
  } satisfies ApiResponse<T>);
