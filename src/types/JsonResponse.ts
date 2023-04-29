/**
 * JsonResponse type is used as the base type for what can be returned from the server when using `runJSON()`.
 *
 * Note that this type is not a JSON type as this only support `{}` based types and all the other JSON string forms are not supported such as arrays or single strings.
 *
 * The reason why the other types are not supported is because the runJSON method actually injects the values of `ok` and `status` into the response before returning it.
 *
 * Exporting this type so that you can explicitly type your body objects
 * with this to ensure that it is correctly typed at point of value definition
 * instead of only type checking when you call the `.runJSON` method.
 */
export type JsonResponse = Record<string | number | symbol, any>;

/*

@todo Try using with array? Actually can I put in these values into a array??? as props since arrays are also just objects??
THIS ONE i need to fix!!! FUCK
JSON only allow string to be keys

*/
// export type JsonResponse = Record<string, any>;
// export interface JsonResponse {
//   [key: string]:
//     | string
//     | Array<string>
//     //
//     | number
//     | Array<number>
//     //
//     | boolean
//     | Array<boolean>
//     //
//     | null
//     | Array<null>
//     // It can arbitrarily nest itself
//     | JsonResponse
//     | Array<JsonResponse>;
// }
