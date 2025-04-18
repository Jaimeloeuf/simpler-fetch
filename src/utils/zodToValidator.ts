import type { z, ZodType } from "zod";

import type { Validator } from "../types";

/**
 * Utility to convert a zod parser to validator function for validating response
 * data in `Fetch` run methods.
 *
 * Alternative conversion using the zod `safeParse` method instead.
 * The problem with this, is that no exceptions are thrown from the parser,
 * which means that the API lib will always return its own Exception instance
 * with a Validation Failed exception message, while it might be preferrable for
 * users to receive the actual `ZodError` by having it bubble through our API
 * library. So that users can get it with `const [err, res] =` and they can
 * check `err` type using `instanceof`.
 *
 * Alternative using safeParse
 * ```typescript
 * const zodToValidator =
 *   <ZodParserType extends ZodType>(parser: ZodParserType) =>
 *   (data: unknown): data is z.infer<ZodParserType> =>
 *     parser.safeParse(data).success;
 * ```
 */
export const zodToValidator = <ZodParserType extends ZodType>(
  parser: ZodParserType
) =>
  ((data: unknown): data is z.infer<ZodParserType> => (
    // Always return true, cos if there is no error thrown by Zod,
    // it means it successfully parsed it.
    parser.parse(data), true
  )) satisfies Validator<z.infer<ZodParserType>> as Validator<
    z.infer<ZodParserType>
  >;
