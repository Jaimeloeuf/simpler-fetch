# simpler-fetch
`simpler-fetch` is an abstraction on top of the `window.fetch` method with ZERO dependencies of around 1.1kb and around 0.5kb with level 6 gzip.

It **DOES NOT** introduce any new features at all. It only makes it easier and nicer to work with the fetch method, such as by providing a simple way to set baseUrls, and by providing a method to delay generating headers.

This library is a JS ES6 module, which can be tree shaked when using with a bundler.

***Note that this does not test if `window.fetch` is available to save that few bytes. If `window.fetch` is not available, do not load this library directly, load a [polyfill](https://github.com/github/fetch) first before loading this library.***


## Intended use
This library is intended for any projects that want a simple to use and lightweight API library without resorting to deal with the low level and cumbersome fetch API.

This library is designed to make working with JSON APIs extremely easy, and it also provides TypeScript support to improve the development experience.


## API
This library exposes the functions, [`_fetch`](#_fetch), [`fcf`](#fcf), [`oof`](#oof). Where [`oof`](#oof) is the recommended way for most users using this library.

See the [sample project provided](./sample/) to learn more about it and to play around with it.
Below are simple examples of how to use them, where all will achieve the same result.


### \_fetch
Simple fetch abstraction to refactor the API and does body stringification if needed.

This is the bare minimum abstraction and used by `oof` and `fcf` under the hood, **not recommended** unless you have a very specific use case. The [`oof`](#oof) and [`fcf`](#fcf) abstractions are alot nicer to work with.

```javascript
import { _fetch } from "simpler-fetch";

(async function () {
  const response = await _fetch(
    "http://localhost:3000/test",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        randomHeader: true,
        anotherHeader: "value",
        lastHeader: 1,
      },
    },
    { test: true, anotherTest: "testing" }
  ).then((response) => response.json());

  console.log("Response", response);
})();
```


### oof
oof: Object Oriented Fetch abstraction over `_fetch`.
This object oriented approach gives users a familiar chainable interface to build their API calls.

This is also **the recommended way** to use this library as a end user.

See the [sample project provided](./sample/) for a more in depth example on using `oof`

#### Basic GET Example using es6 import syntax with bundlers
```javascript
import { oof } from "simpler-fetch";

(async function () {
  // Set Base URL once and all subsequent API calls with use this base API url
  oof._baseUrl = "https://deployed-api.com";
  
  // Base URL can be set like this if using a bundler that injects NODE_ENV in
  // oof._baseUrl =
  //   process.env.NODE_ENV === "production"
  //     ? "https://deployed-api.com"
  //     : "http://localhost:3000";

  // Make a GET request to https://deployed-api.com/test and parse the response as JSON
  const response = await oof
    .GET("/test")
    .runJSON(); // Make the API call and parse the response as JSON

  console.log("Response", response);
})();
```

#### Basic POST Example
```javascript
import { oof } from "simpler-fetch";

(async function () {
  oof._baseUrl = "https://deployed-api.com";

  // Make a POST request and use a bunch of different ways to generate header values
  // Manually parse the response as JSON, the shortform `runJSON` can also be used
  // Use the `run` method if you need to parse the response as something else like text
  const response = await oof
    .POST("/test")
    // Can be a synchronous function that returns a header object
    .header(() => ({ randomHeader: true, anotherHeader: "value" }))
    // Can be an asynchronous function that returns a header Promise<object>
    .header(async () => ({ asyncHeader: await Promise.resolve("value") }))
    // Can also just directly pass in a header object. Header method can be called multiple times
    .header({ lastHeader: 1 })
    .data({ test: true, anotherTest: "testing" })
    .run()
    .then((response) => response.json());

  console.log("Response", response);
})();
```

#### Using a different base URL for one off API call
```javascript
import { oof } from "simpler-fetch";

(async function () {
  oof._baseUrl = "https://deployed-api.com";

  // Make a API call to a different API domain, but only for this single request by using a full URL path
  // The library will check if http:// or https:// is included in the URL, and skip base URL if included
  // Any subsequent API calls will still use the default "https://deployed-api.com" as base URL
  const response = await oof
    .GET("https://other-api-integration.com/test")
    .runJSON(); // Make the API call and parse the response as JSON

  // Subsequent API calls with just the path and not a full URL will have the base URL appended,
  // So in this case, this is a GET request to https://deployed-api.com/test
  const response = await oof
    .GET("/test")
    .runJSON(); // Make the API call and parse the response as JSON

  console.log("Response", response);
})();
```


### fcf
fcf: Functional, Curried, Fetch abstraction over `_fetch`.
This is for users who prefer a more functional approach to building API data before calling the API.

```javascript
import { fcf } from "simpler-fetch";

(async function () {
  const fetch = fcf("http://localhost:3000");

  const response = await fetch("/test")({
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      randomHeader: true,
      anotherHeader: "value",
      lastHeader: 1,
    },
  })({ test: true, anotherTest: "testing" }).then((response) =>
    response.json()
  );

  console.log("Response", response);
})();
```


## Using with firebase auth
[See documentation for using this lib with firebase authentication](./firebase-auth.md)


## License, Author and Contributing
This project is developed and made available under the [MIT License](./LICENSE). Feel free to use it however you like!

If you have any questions, open a github issue!

Authors:
- [JJ](https://github.com/Jaimeloeuf)