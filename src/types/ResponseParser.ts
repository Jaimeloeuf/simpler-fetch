/**
 * Function type for response parsing.
 */
export type ResponseParser<T> = (res: Response) => Promise<T>;
