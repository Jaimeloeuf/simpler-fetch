# simpler-fetch
`simpler-fetch` is an abstraction on top of the `window.fetch` method with ZERO dependencies.

It DOES NOT introduce any new features at all. It only makes it easier and nicer to work with the fetch method, such as by providing a simple way to with with baseUrls and by providing a method to delay generating headers.

This library is a JS module, which can be tree shaked when using with a bundler.


## API
This library exposes the functions, `_fetch`, `fcf`, `oof`.
Below are examples of how to use them, where all will achieve the same result.


### \_fetch
Simple fetch abstraction to refactor the API and does body stringification if needed.

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

```javascript
import { oof } from "simpler-fetch";

(async function () {
  // Base URL can be set like this if using a bundler
  oof._baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://deployed-api.com"
      : "http://localhost:3000";

  const response = await oof
    .POST("/test")
    .headers(() => ({ randomHeader: true, anotherHeader: "value" }))
    .headers({ lastHeader: 1 })
    .data({ test: true, anotherTest: "testing" })
    .run()
    .then((response) => response.json());

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