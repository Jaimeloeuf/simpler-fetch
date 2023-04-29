# simpler-fetch
[![NPM version](https://img.shields.io/npm/v/simpler-fetch?style=flat-square)](https://npmjs.org/package/simpler-fetch)
[![NPM downloads](https://img.shields.io/npm/dm/simpler-fetch?style=flat-square)](https://npmjs.org/package/simpler-fetch)

`simpler-fetch` is a super simple to use [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) abstraction with ZERO dependencies, making it super small at just **0.5kb** with brotli compression!

It **DOES NOT** introduce any new features at all. It only simplifies the `fetch API` to make it easier and safer to work with by providing abstractions such as a chainable way to configure the `fetch` options before making the fetch call, a simple way to set baseUrls, a way to delay generating headers.

Since this library is just a wrapper over `fetch`, it **can be used in an isomorphic context** as long as a spec compliant `fetch` function is available in the global scope as it is not tied to any specific fetch implementation.

This library only exports a JS ES6 module, which means that it can be tree shaked when used with a bundler. However this also means that NodeJS users need to `import` instead of `require`, see [sample project](./sample/node/).

***Note that this library does not test if `fetch` is available to save that few bytes. If `fetch` is not available globally, DO NOT load this library directly, load a [polyfill](https://github.com/github/fetch) or run a monkey patch first before loading this library.***


## Intended use
This library is intended for any projects that want a simple to use and lightweight HTTP API client library without resorting to deal with the low level and cumbersome fetch API or use a super heavy library like `superagent`.

This library is designed to make working with APIs (especially JSON APIs) extremely easy, and provides first class TypeScript support to improve the development experience with strict type safety.


## Documentation & Changes
***<a href="./docs/v7%20to%20v8%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v7 to v8 major breaking change upgrade</a>***
- [See full API and other technical documentations](./docs/README.md)
- [See CHANGELOG for specific changes across versions!](./CHANGELOG.md)


## Installation
Install this library from npm or github using
```shell
# Install from npm
npm i simpler-fetch

# Install from github
npm i https://github.com/Enkel-Digital/simpler-fetch/
```


## Using the library
`oof` stands for Object Oriented Fetch. This object oriented approach gives users a familiar chainable interface to build their API calls. Users create a new instance of the `oof` class for every API call and use the chainable methods to configure the API options to pass to `fetch` before making the fetch call.

The `oof` class is the only exported value from the simpler-fetch module using a named export ([see here to understand why a named export is used despite this being the sole export](https://listed.to/@JJ/37419/named-exports-are-better-than-default-ones-mostly)).

See the [sample project provided](./sample/) for a full example on using `oof` and install it to play around with it. Below are some simpler examples to get you started quickly.

### Quickstart
```typescript
// Import the library as a npm dependency
import { oof } from "simpler-fetch";

// Alternatively you can import this library directly from a CDN link
// You can use any provider, however jsDelivr is shown here as it can be used in China and it is backed by multiple CDNs
// import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch/dist/index.js";
//
// For CDN use, YOU ARE ADVISED to peg your code to a specific version to ensure it does not break between upgrades, e.g.
// import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch@8.0.0/dist/index.js";

// Start using it!
function getExample() {
    const { res, err } = await oof
        .GET("https://jsonplaceholder.typicode.com/todos/1")
        .once() // Skip the baseUrl
        .runJSON();

    console.log(res, err);
}

// POST request example
function postExample() {
    const { res, err } = await oof
        .POST("https://jsonplaceholder.typicode.com/posts")
        .once() // Skip the baseUrl
        .header({ someAuthenticationToken: "superSecureTokenString" })
        .data({ title: "foo", body: "bar", userId: 1 })
        .runJSON();

    console.log(res, err);
}
```

### Basic GET Example using es6 import syntax with bundlers
```typescript
import { oof } from "simpler-fetch";

// Set Base URL once and all subsequent API calls with use this base API url
oof.setBaseURL("https://deployed-api.com");

// Base URL can be set like this if using a bundler that injects NODE_ENV in
// oof.setBaseURL(
//   process.env.NODE_ENV === "production"
//     ? "https://deployed-api.com"
//     : "http://localhost:3000"
// );

// Make a GET request to https://deployed-api.com/test and parse the response as JSON
const { res, err } = await oof
    .GET("/test")
    .runJSON(); // Make the API call and parse the response as JSON

console.log("Response", res);
```

### Basic POST Example
```typescript
import { oof } from "simpler-fetch";

oof.setBaseURL("https://deployed-api.com");

// Make a POST request and use a bunch of different ways to generate header values
const { res, err } = await oof
    .POST("/test")
    // Can be a synchronous function that returns a header object
    .header(() => ({ randomHeader: true, anotherHeader: "value" }))
    // Can be an asynchronous function that returns a header Promise<object>
    .header(async () => ({ asyncAuthToken: await Promise.resolve("secret") }))
    // Can also just directly pass in a header object. Header method can be called multiple times
    .header({ someAuthenticationToken: "superSecureTokenString" })
    .bodyJSON({ test: true, anotherTest: "testing" })
    .runJSON();

console.log("Response", res);
```

### Make a one off API call to a different domain
```typescript
import { oof } from "simpler-fetch";

oof.setBaseURL("https://deployed-api.com");

// Make a API call to a different API domain, but only
// for this single request by using the `once` method.
// Any subsequent API calls will still use the default
// "https://deployed-api.com" as base URL.
//
// Reference:
// - https://stackoverflow.com/a/60006313
// - https://url.spec.whatwg.org/#url-writing
function customUrlExample() {
    const { res, err } = await oof
        .GET("https://other-api-integration.com/test")
        .once() // Skip the baseUrl
        .runJSON(); // Make the API call and parse the response as JSON

    console.log("Response", res);
}

// Subsequent API calls with just the path and not a full URL will have the base URL appended,
// So in this case, this is a GET request to https://deployed-api.com/test
function baseUrlExample() {
    const { res, err } = await oof
        .GET("/test")
        .runJSON(); // Make the API call and parse the response as JSON

    console.log("Response", res);
}
```


## Supported Platforms
This library is designed for modern browsers in mind only and does not support older browsers/node by default although you can monkey patch it to work for example by using polyfills.

- Because this library only exports a JS ES6 module, your target platform (browser/node) must support ES6 modules.
- This library relies on the modern [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), so if your platform does not have this natively, you need to monkey patch it in using a `polyfill` or something like `node-fetch`.


## Using with firebase auth
[See documentation for using this library with firebase authentication](./docs/firebase-auth.md)


## Compared to other libraries
This library does not have as many advanced features as libraries like `Axios` (and it will never be) but the advantage of this is that it is much simpler to learn, use and is alot smaller!

### Advantages
- This library is extremely simple to use compared to other libraries, with a simpler and clear API backed by strong types to leverage the TS LSP to help with code completion.
- This library does error handling better.
    - This is subjective but take a look at it yourself.
    - All the `run` methods do not throw any errors / let any errors bubble up to the caller, instead errors are treated as values returned together with the response if any. This means that users do not have to always write extra boilerplate code at their API call sites just to handle errors.
    - Read more about how [this library views error handling](./docs/oof%20error%20handling.md)
- This library is extremely small compared to other popular HTTP clients like `Axios` and `superagent`, here is a comparison on library size after minification and using brotli compression
    1. 0.5kb - `simpler-fetch`
    1. 6kb - `axios v0.27.2` is 12 times larger than `simpler-fetch`
    1. 13kb - `superagent v8.0.0` is 26 times larger than `simpler-fetch`

### Disadvantages
- This has less advanced features like a nice elegant way to include abort signals
    - However, since this library is based on the `fetch` API, this still have escape hatches to directly configure the `fetch` options to pass in an AbortSignal with the `options` method.
- This library is designed for newer platforms and doesn't support older platforms
    - Although it can work with it, as long as you downlevel the code and use a `fetch` polyfill.


## Inspirations
### Things that inspired this library
- [Go-lang's error handling](https://go.dev/blog/error-handling-and-go)
- [Axios](https://www.npmjs.com/package/axios)
- [superagent](https://www.npmjs.com/package/superagent)

### Past projects
- [eazyfetch](https://github.com/Enkel-Digital/eazyfetch) is the predecessor of this library that is now deprecated.
    - [easyfetch](https://github.com/RealmTeam/easyfetch) is the inspiration for `eazyfetch`
- [fetch-with-fire](https://github.com/Enkel-Digital/fetch-with-fire) was the predecessor of the `eazyfetch` library and it was created to primarily reduce the boiler plate code needed to include auth tokens on every API call.

### Similar projects
These are some similar projects that are all simple wrappers/abstractions on top of the `fetch` API just like the old v7 of this library, but their API is more clunky (biased opinion) and more rigid. They also do not have a nice way to do error handling, where you have to deal with catching errors yourself like most other libraries.
- https://github.com/posva/mande
- https://github.com/typicode/fetchival


## Technical Details
Most of the detailed technical explanations are all written in the [source code](./src/index.ts) itself, either as generic comments or within JSDocs so do explore that for more details. This section just documents some details to understand why certain technical decisions were made that cannot be found in the source code.

1. `oof` does error handling alot differently compared to other HTTP client libraries
    - [See this to learn more](./docs/oof%20error%20handling.md)
1. Import paths in TS source files are always written with the `.js` extension (no longer an issue now as all source code is in a single file)
    - This is because TS will not modify the file extension as it generates the JS files,
    - And when used in node js, module import paths require the full file extension to be used.
    - Therefore this is needed to work on node.js runtimes.
    - References
        - <https://stackoverflow.com/questions/68928008/cant-import-module-without-the-js-extension-in-nodejs>
        - <https://nodejs.org/api/esm.html#esm_import_specifiers>
        - <https://github.com/microsoft/TypeScript/issues/40878>


## Archived
[See archived content here](./archive/)

### \_fetch
In older versions of this library, there was another abstraction on top of the `fetch` API to simplify the API and do body stringification if needed. But because it was not very practical and generally not really used, it has been removed/abandoned now. You can find its source code and documentation [here](./archive/_fetch/)

### fcf
In older versions of this library, there was another abstraction on top of `_fetch` built for functional programming. But because it was not very practical and generally not really used, it has been removed/abandoned now. You can find its source code and documentation [here](./archive/fcf/)


## License, Author and Contributing
This project is developed by [JJ](https://github.com/Jaimeloeuf) and made available under the [MIT License](./LICENSE). Feel free to use it however you like and open a github issue if you have any questions or problems!