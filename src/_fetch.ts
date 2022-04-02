/** Simple fetch abstraction to refactor the API and does body stringification if needed */
export const _fetch = (
  url: string,
  opts: object = {},
  // body: object | string | undefined
  body?: object | string
) =>
  fetch(url, {
    ...opts,

    // Only include the body field if a body value is provided
    // Stringify the body object if it isn't already
    body: body && typeof body === "object" ? JSON.stringify(body) : body,
  });
