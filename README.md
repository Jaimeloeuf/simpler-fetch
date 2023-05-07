# simpler-fetch
[![NPM version](https://img.shields.io/npm/v/simpler-fetch?style=flat-square)](https://npmjs.org/package/simpler-fetch)
[![NPM downloads](https://img.shields.io/npm/dm/simpler-fetch?style=flat-square)](https://npmjs.org/package/simpler-fetch)

> `simpler-fetch` is a super simple to use [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) abstraction with ZERO dependencies (there is only optional *Type level dependencies*), making it super small at just **1.2kb** with brotli compression!

It **DOES NOT** introduce any new features at all. It only simplifies the `fetch API` to make it easier and safer to work with by providing abstractions such as a chainable way to configure the `fetch` options before making the fetch call, a simple way to set baseUrls, a way to delay generating headers.

Since this library is just a wrapper over `fetch`, it **can be used in an isomorphic context** as long as a spec compliant `fetch` function is available in the global scope as it is not tied to any specific fetch implementation.

This library only exports a JS ES6 module, which means that it can be tree shaked when used with a bundler. However this also means that NodeJS users need to `import` instead of `require`, see [sample project](./sample/node/).

***Note that this library does not test if `fetch` is available to save that few bytes. If `fetch` is not available globally, DO NOT load this library directly, load a [polyfill](https://github.com/github/fetch) or run a monkey patch first before loading this library.***


## Intended use
This library is intended for any projects that want a simple to use and lightweight HTTP API client library without resorting to deal with the low level and cumbersome fetch API or use a super heavy library like `superagent`.

This library is designed to make working with APIs (especially JSON APIs) extremely easy, and provides first class TypeScript support to improve the development experience with strict type safety.


## Documentation & Changes
***<a href="./docs/v8%20to%20v9%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v8 to v9 major breaking change upgrade</a>***

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
This library exports `oof`, which stands for Object Oriented Fetch. This object oriented builder pattern approach gives users a familiar chainable interface to build their API calls with chainable methods to configure API options for `fetch` before every API call.

This library exports everything as [named exports](https://listed.to/@JJ/37419/named-exports-are-better-than-default-ones-mostly).

See the [sample project provided](./sample/) for a full example on using `oof` and install it to play around with it. Below are some simpler examples to get you started quickly.

### Quickstart
```typescript
// Import the library as a npm dependency
import { oof } from "simpler-fetch";

// Alternatively you can import this library directly from a CDN link
// You can use any provider, however jsDelivr is shown here as it can be used in China and it is backed by multiple CDNs
// For CDN use, PEG your code to a specific version to ensure it does not break between upgrades, e.g.
// import { oof } from "https://cdn.jsdelivr.net/npm/simpler-fetch@9.0.0/dist/index.js";

// Basic GET example
function getExample() {
    const { res, err } = await oof
        // Make a one off API call to this URL without any base Urls
        .useOnce("https://jsonplaceholder.typicode.com/todos/1")
        .GET()
        .runJSON();

    console.log(res, err);
}

// POST request example
function postExample() {
    const { res, err } = await oof
        // Make a one off API call to this URL without any base Urls
        .useOnce("https://jsonplaceholder.typicode.com/posts")
        .POST()
        .header({ someAuthenticationToken: "superSecureTokenString" })
        .bodyJSON({ title: "foo", body: "bar", userId: 1 })
        .runJSON();

    console.log(res, err);
}
```

### Basic POST Example
```typescript
import { oof } from "simpler-fetch";

// Add a base Url and set it to be the default base Url.
oof.addBase("default", "https://deployed-api.com").setDefault("default");

// Make a POST request and use a bunch of different ways to generate header values
const { res, err } = await oof
    // Use the default base Url
    .useDefault()
    .POST("/test")
    // Can be a synchronous function that returns a header object
    .header(() => ({ randomHeader: "true", anotherHeader: "value" }))
    // Can be an asynchronous function that returns a header Promise<object>
    .header(async () => ({ asyncAuthToken: await Promise.resolve("secret") }))
    // Can also just directly pass in a header object. Header method can be called multiple times
    .header({ someAuthenticationToken: "superSecureTokenString" })
    .bodyJSON({ test: "true", anotherTest: "testing" })
    .runJSON();

console.log(res, err);
```

Once again, see the [sample project provided](./sample/) for a full example on using the library.


## Supported Platforms
This library is designed for modern browsers in mind only and does not support older browsers/node by default although you can monkey patch it to work for example by using polyfills.

- Because this library only exports a JS ES6 module, your target platform (browser/node) must support ES6 modules.
- This library relies on the modern [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), so if your platform does not have this natively, you need to monkey patch it in using a `polyfill` or something like `node-fetch`.


## Using with firebase auth
[See documentation for using this library with firebase authentication](./docs/firebase-auth.md)


## Response validation
This library supports Response validation, it supports it via user supplied validator functions instead of bringing on a validation library itself, since it is will be a huge dependency and not all users will want to use it. Not including a validation library will also mean that users have the flexibility to choose and use whatever validation library they want to use.

However, it can be troublesome for users to convert their own validation library's validators to the expected validator type of this library, therefore utility methods are exported from this library to support adapting validation libraries' validator functions to the expected validator type of this library in a type safe manner.

Here is a list of popular validation libraries that are supported with utility adapters, if your validation library is not here, you can create an issue for it and I will add a adapter if it is popular enough.
1. [Response validation with Zod](./docs/validation-zod.md)


## Compared to other libraries
This library does not have as many advanced features as libraries like `Axios` (and it will never be) but the advantage of this is that it is much simpler to learn, use and is alot smaller!

### Advantages
- This library is extremely simple to use compared to other libraries, with a simple and clear API built with strong types for type safety and leverages TS LSP for code completion.
- This library does error handling better.
    - This is subjective but take a look at it yourself.
    - All the `run` methods do not throw any errors / let any errors bubble up to the caller, instead errors are treated as values returned together with the response if any. This means that users do not have to always write extra boilerplate code at their API call sites just to handle errors.
        - Read more about how [this library views error handling](./docs/oof%20error%20handling.md)
- This library is extremely small compared to other popular HTTP clients like `Axios` and `superagent`, here is a comparison of the minified library after using brotli compression
    1. 1.2kb - `simpler-fetch`
    1. 14.3kb - [`axios v1.4.0`](https://cdn.jsdelivr.net/npm/axios@1.4.0/dist/axios.min.js) is XYZ times larger than `simpler-fetch`
    1. 19.1kb - [`superagent v8.0.9`](https://cdn.jsdelivr.net/npm/superagent@8.0.9/dist/superagent.min.js) is XYZ times larger than `simpler-fetch`

### Disadvantages
- This has less advanced features like a nice and elegant way to do retries
    - However, since this library is basically a wrapper around the `fetch` API to use the Builder pattern, you have the necessary tools and escape hatches to directly configure `fetch` options to implement something like that yourself.
- This library is designed for newer platforms and doesn't support older platforms
    - Although it can work with it, as long as you downlevel the code and use a `fetch` polyfill.
- This library does not support users passing in custom AbortControllers
    - The reason is because the main use case for AbortControllers are usually for setting custom timeouts
        - And this is already supported by the `timeoutAfter` method on `Fetch`.
    - Therefore this is not supported since there are not many specific use cases for it right now.
        - Might implement this in the future if there is an actual concrete use case for it.
- Although this library supports using the `HEAD` and `OPTIONS` HTTP methods,
    - They are not as easy to use as other common HTTP methods like `GET` and `POST`
    - Since these are rather low level and extremely rarely used HTTP methods, users need to use the more cumbersome `HTTP` method on `Builder` instances.
        - See the sample project for example on this.


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
1. POST, PUT and PATCH HTTP methods are all supported, see this link on the difference
    - <https://en.wikipedia.org/wiki/PATCH_(HTTP)#:~:text=The%20main%20difference%20between%20the,instructions%20to%20modify%20the%20resource.>
1. This library implements the builder pattern with 3 levels of indirection (`oof`, `Builder` and `Fetch` classes)
    - Why 3? Why cant we use less classes for a smaller library?
        - Yes, the library can be smaller. But with this setup, the DX is improved as it forces you to use the method chaining in a specific order / sequence that makes the more sense.
        - For example
            1. Users can only set the JSON body after you set the base Url and path.
            1. Users can only set API call specific headers after you set things like HTTP methods.
    - The flow of method chaining configuration
        1. `oof` class
            - At the root layer, you can either
                1. Configure the base Urls and default base Url.
                1. Select what base Url you would like to use.
        1. `Builder` class
            - At the second layer, you can either
                1. Select a HTTP method and Url path to use for the API call.
                1. Configure default `RequestInit` options or Header values for all future API calls on the same base Url.
            - Selecting the HTTP methods involve using instance methods like `GET` or `POST` with an optional path
        1. `Fetch` class
            - At the last layer, you get to configure options for the specific API call before actually making the API call.
            - Some of the things you can configure are
                1. The specific headers needed
                1. Request body
                1. Custom `RequestInit` options
                1. Custom timeout value
            - After configuration, you can make the API call using the `run` methods such as
                1. `run` to get the raw Response object back from `window.fetch`
                1. `runJSON` to get response back as a JSON value
                1. `runText` to get response back as a String
                1. `runBlob` to get response back as a Blob
                1. `runFormData` to get response back as Form Data
                1. `runArrayBuffer` to get response back as an ArrayBuffer
            - All the run methods also support passing in an optional validator to do Response Validation.
                - See above section on Response Validation.


## Archived
[See archived content here](./archive/)

### oof
Archived version v8 of this library. You can find its source code and documentation [here](./archive/oof/)

### \_fetch
In older versions of this library, there was another abstraction on top of the `fetch` API to simplify the API and do body stringification if needed. But because it was not very practical and generally not really used, it has been removed/abandoned now. You can find its source code and documentation [here](./archive/_fetch/)

### fcf
In older versions of this library, there was another abstraction on top of `_fetch` built for functional programming. But because it was not very practical and generally not really used, it has been removed/abandoned now. You can find its source code and documentation [here](./archive/fcf/)


## License, Author and Contributing
This project is developed by [JJ](https://github.com/Jaimeloeuf) and made available under the [MIT License](./LICENSE). Feel free to use it however you like and open a github issue if you have any questions or problems!