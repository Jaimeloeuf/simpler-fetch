/** Simple fetch abstraction to make the API more ergonomic and performs body stringification if needed */
export const _fetch = (url: string, opts: RequestInit = {}, body?: any) =>
  fetch(url, {
    ...opts,

    /*
      References:
      - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
      - https://tc39.es/ecma262/#sec-json.stringify

      The JSON.stringify method takes many types of arguments as specified in the reference link above.
      Due to the huge variety of argument types and the lack of a standard TypeScript interface/type
      describing it, body parameter is explicitly typed as `any`.
      The param's type is basically anything that can be serialized by JSON.stringify and also any child types of `BodyInit | null`
    */

    // Only include the body field if a body value is provided
    // Only stringify body, if a runtime object type value is passed in
    body: body && typeof body === "object" ? JSON.stringify(body) : body,
  });
