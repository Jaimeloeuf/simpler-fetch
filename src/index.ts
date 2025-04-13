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

export * from "./SimplerFetch";
export * from "./errors";
export * from "./exceptions";
export * from "./utils";
export type * from "./types";
