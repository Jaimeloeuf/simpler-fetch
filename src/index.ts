/* Check once if fetch exists on library load */
import { SimplerFetchError } from "./errors";
if (fetch == null) {
  throw new SimplerFetchError(
    "[simpler-fetch] 'fetch' is not defined in global scope please polyfill it first!"
  );
}

/**
 * Barrel file to export everything a library user can access.
 */

export * from "./errors";
export * from "./exceptions";
export * from "./SimplerFetch";
export type * from "./types";
export * from "./utils/jsonParser";
export * from "./utils/zodToValidator";
