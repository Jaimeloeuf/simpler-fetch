/**
 * Simple fetch abstraction to refactor the API and does body stringification if needed
 * @param {String} url
 * @param {object} opts
 * @param {object | String | undefined} body
 */
export const _fetch = (url, opts = {}, body) =>
  fetch(url, {
    ...opts,

    // Only include the body field if a body value is provided
    // Stringify the body object if it isn't already
    body: body && typeof body === "object" ? JSON.stringify(body) : body,
  });
