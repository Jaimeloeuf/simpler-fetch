# simpler-fetch
`simpler-fetch` is a super simple to use [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) abstraction with ZERO dependencies, making it super small at just 0.4kb with brotli compression!

It **DOES NOT** introduce any new features at all. It only simplifies the `fetch API` to make it easier and nicer to work with, such as by providing a simple way to set baseUrls, and by providing a method to delay generating headers. Since this is just a wrapper over fetch, this library **can be used in an isomorphic context**, as long as a fetch function is available in the global scope as it is not tied to any specific fetch implementation.

This library only exports a JS ES6 module, which means that it can be tree shaked when used with a bundler. However this also means that NodeJS users need to `import` instead of `require`, see [sample project](./sample/node/).

***Note that this library does not test if `fetch` is available to save that few bytes. If `fetch` is not available globally, DO NOT load this library directly, load a [polyfill](https://github.com/github/fetch) or run a monkey patch first before loading this library.***


## Intended use
This library is intended for any projects that want a simple to use and lightweight API library without resorting to deal with the low level and cumbersome fetch API.

This library is designed to make working with JSON APIs extremely easy, and it also provides TypeScript support to improve the development experience.


## Documentation & Changes
- [See CHANGELOG for more changes across versions!](./CHANGELOG.md)


## Installation
Install this library from npm or github using
```shell
# Install from npm
npm i simpler-fetch

# Install from github
npm i https://github.com/Enkel-Digital/simpler-fetch/
```


## Using the library
`oof` stands for Object Oriented Fetch. This object oriented approach gives users a familiar chainable interface to build their API calls.

The `oof` class is the only exported value from the simpler-fetch module using a named export ([see here to understand why a named export is used despite this being the sole export](https://listed.to/@JJ/37419/named-exports-are-better-than-default-ones-mostly)).

See the [sample project provided](./sample/) for a full example on using `oof` and install it to play around with it. Below are some simpler examples of how to use them, where all will achieve the same result.

### Quickstart
```javascript
// Import the library as a npm dependency
import { oof } from "simpler-fetch";

// Alternatively you can import this library directly from a CDN link
// You can use any provider, however jsDelivr is shown here as it can be used in China and it is backed by multiple CDNs
// import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch/dist/index.js";
//
// For CDN use, YOU ARE ADVISED to peg your code to a specific version to ensure it does not break between upgrades, e.g.
// import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch@7.0.2/dist/index.js";

// Start using it!
oof
    .GET("https://jsonplaceholder.typicode.com/todos/1")
    .runJSON()
    .then(console.log);

// POST request example
oof
    .POST("https://jsonplaceholder.typicode.com/posts")
    .header({ someAuthenticationToken: "superSecureTokenString" })
    .data({ title: "foo", body: "bar", userId: 1 })
    .runJSON()
    .then(console.log);
```

### Basic GET Example using es6 import syntax with bundlers
```javascript
import { oof } from "simpler-fetch";

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
```

### Basic POST Example
```javascript
import { oof } from "simpler-fetch";

oof._baseUrl = "https://deployed-api.com";

// Make a POST request and use a bunch of different ways to generate header values
// Manually parse the response as JSON, the shortform `runJSON` can also be used
// Use the `run` method if you need to parse the response as something else like text
const response = await oof
    .POST("/test")
    // Can be a synchronous function that returns a header object
    .header(() => ({ randomHeader: true, anotherHeader: "value" }))
    // Can be an asynchronous function that returns a header Promise<object>
    .header(async () => ({ asyncAuthToken: await Promise.resolve("secret") }))
    // Can also just directly pass in a header object. Header method can be called multiple times
    .header({ someAuthenticationToken: "superSecureTokenString" })
    .data({ test: true, anotherTest: "testing" })
    .run()
    .then((response) => response.json());

console.log("Response", response);
```

### Using a different base URL for one off API call
```javascript
import { oof } from "simpler-fetch";

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
```


## Using with firebase auth
[See documentation for using this library with firebase authentication](./firebase-auth.md)


## Technical Details
1. Import paths in TS source files are always written with the `.js` extension (no longer an issue now as all source code is in a single file)
    - This is because TS will not modify the file extension as it generates the JS files,
    - And when used in node js, module import paths require the full file extension to be used.
    - Therefore this is needed to work on node.js runtimes.
    - References
        - <https://stackoverflow.com/questions/68928008/cant-import-module-without-the-js-extension-in-nodejs>
        - <https://nodejs.org/api/esm.html#esm_import_specifiers>
        - <https://github.com/microsoft/TypeScript/issues/40878>


## Support
This library is designed for modern browsers in mind only and does not support older browsers/node by default although you can monkey patch it to work for example by using polyfills.

- Because this library only exports a JS ES6 module, your target platform (browser/node) must support ES6 modules.
- This library relies on the modern [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), so if your platform does not have this natively, you need to monkey patch it in using a `polyfill` or something like `node-fetch`.


## Archived
### \_fetch
In older versions of this library, there was another abstraction on top of the `fetch` API to simplify the API and do body stringification if needed. But because it was not very practical and generally not really used, it has been removed/abandoned now. You can find its source code and documentation [here](./archive/_fetch/)

### fcf
In older versions of this library, there was another abstraction on top of `_fetch` built for functional programming. But because it was not very practical and generally not really used, it has been removed/abandoned now. You can find its source code and documentation [here](./archive/fcf/)


## License, Author and Contributing
This project is developed by [JJ](https://github.com/Jaimeloeuf) and made available under the [MIT License](./LICENSE). Feel free to use it however you like and open a github issue if you have any questions or problems!