import type { ResponseParser } from "../../types";

/**
 * `jsonParser` utility function is used to parse Response data as json.
 */
export const jsonParser: ResponseParser<any> = (res: Response) => res.json();
