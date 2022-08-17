# simpler-fetch
**Table of Contents**
[[toc]]


## Introduction
`simpler-fetch` is a super simple to use [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) abstraction with ZERO dependencies, making it super small at just 0.4kb with brotli compression!

It **DOES NOT** introduce any new features at all. It only makes it easier and nicer to work with the fetch method, such as by providing a simple way to set baseUrls, and by providing a method to delay generating headers. Since this is just a wrapper over fetch, this library **can be used in an isomorphic context**, as long as a fetch function is available in the global scope as it is not tied to any specific fetch implementation.

::: tip
This library only exports a JS ES6 module, which means that it can be tree shaked when used with a bundler. However this also means that NodeJS users need to `import` instead of `require`, see [sample project](./sample/node/).
:::

::: danger
Note that this library does not test if `fetch` is available to save that few bytes. If `fetch` is not available globally, DO NOT load this library directly, load a [polyfill](https://github.com/github/fetch) or run a monkey patch first before loading this library.
:::


## Intended use
This library is intended for any projects that want a simple to use and lightweight API library without resorting to deal with the low level and cumbersome fetch API.

This library is designed to make working with JSON APIs extremely easy, and it also provides TypeScript support to improve the development experience.


## Getting Started
Install this library from npm or github using
```shell
# Install from npm
npm i simpler-fetch

# Install from github
npm i https://github.com/Enkel-Digital/simpler-fetch/
```

Alternatively you can import this library directly from a CDN link
You can use any provider, however jsDelivr is shown here as it can be used in China and it is backed by multiple CDNs
```javascript
import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch/dist/index.js";
```

For CDN use, **YOU ARE ADVISED** to peg your code to a specific version to ensure it does not break between upgrades, e.g.
```javascript
import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch@7.0.2/dist/index.js";
```


## oof
This is one of the exported values from the simpler-fetch module. `oof` stands for the Object Oriented Fetch abstraction over [`_fetch`](./#_fetch).

This object oriented approach gives users a familiar chainable interface to build their API calls and this is also **the recommended way** to use this library as a end user. See the [sample project provided](./sample/) for a more in depth example on using `oof`.

### Importing the library
```javascript
import { oof } from "simpler-fetch";
```

### Static methods
These are the static methods on the `oof` class

#### _WO_DATA
```javascript
```

#### _W_DATA
```javascript
```

#### GET
<!-- @todo Talk about this registered / full API thing once and subsequently all code will be using relative API routes -->


API call to registered API server
```javascript
await oof
    .GET("/test")
    .runJSON()
    .then((res) => console.log("res", res));
```

API call to registered API server with header set in multiple ways
```javascript
await oof
    .GET("/test")
    // Fixed header object
    .header({ someAuthenticationToken: "superSecureTokenString" })
    // Synchronous function that returns a header object
    .header(() => ({ anotherAuthenticationToken: "secret" }))
    // Asynchronous function that returns a promise that resolves to a header object
    .header(async () => ({ yetAnotherHeaderValue: 123456789 }))
    .runJSON()
    .then((res) => console.log("res", res));
```

API call to local API server with full URL path
```javascript
await oof
    .GET("http://localhost:3000/test")
    .runJSON()
    .then((res) => console.log("res", res));
```

API call to external API server with full path
```javascript
await oof
    .GET("https://jsonplaceholder.typicode.com/todos/1")
    .runJSON()
    .then((res) => console.log("res", res));
```

#### POST
```javascript
```

#### PUT
```javascript
```

#### DEL
```javascript
```

### Methods
#### options
```javascript
```

#### header
```javascript
```

#### data
```javascript
```

#### run
```javascript
```

#### runJSON
```javascript
```


## \_fetch
Simple fetch abstraction over the fetch API and does body stringification if needed.

This is the bare minimum abstraction and it's used by [oof](#oof) under the hood, **do not use this** unless you have a very specific use case. The [oof](#oof) abstraction is alot nicer to work with.

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
