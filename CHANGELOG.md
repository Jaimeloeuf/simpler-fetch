# Changelog
- All notable changes to this project starting from v7 is documented in this file.
- The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

### Changed

### Added

### Removed



## [10.3.1] - 2023-10-13
### Others
1. Update dependencies.


## [10.3.0] - 2023-10-13
### Added
1. Add new `useQuery` method to set Query Params with generics based type checking, to make it more ergonmic to use rather forcing users to set query params using string interpolation when setting their API's URL path.


## [10.2.0] - 2023-09-02
### Added
1. Add new `getURL` method to get the fully formed URL. Useful for times when you need to reflect the full URL.


## [10.1.0] - 2023-08-16
### Added
1. Add new `runVoid` method to always return null for the response data for better type safety to prevent users from accidentally accessing data that should not exist especially for API calls like POST which usually gets back just a 201 with no data at all.


## [10.0.0] - 2023-06-06
[Migration guide for v9 to v10 major breaking change upgrade](./docs/v9%20to%20v10%20migration%20guide.md)

### Main Breaking Changes
The API is now completely changed, it is better to just use the new API directly instead of migrating 1 by 1.

1. Rename `oof` to `sf` to better reflect the library name.

### Changed
1. Rename `oof` to `sf` to better reflect the library name.
1. Require library users to use the methods `useDefaultOptions` and `useDefaultHeaders` to use the default options object and default headers array as they are no longer automatically injected.
    - This is done to remove hidden implicit behaviours.
1. `options` and `header` method is renamed to `useOptions` and `useHeader` to keep the naming consistent.
1. `ApiResponse` returned is now discriminated on the `ApiResponse.ok` property
    - Where a different type can be set for `ApiResponse.ok === false` instead of having both share the same type.
    - This helps library users write simpler code, as they do not need to create another discriminant on their own in the return data type, as they can just rely on the `ApiResponse.ok` property as the discriminant.
1. All the `run` methods have been extended to take a `ErrorType` generic to cast the Response data differently if `ApiResponse.ok === false`, and to accept an optional error response parser as their last function parameter to parse the error response data type differently.
1. Rewrote the sample web app to include more examples and in more detail.
1. Change behavior of how exceptions thrown from within Header functions are returned.
    - They are now wrapped in the new `HeaderException` class, so that library users can easily check that the failure happened in a header function, before using `HeaderException.error` to narrow down the exact cause.
1. Change `RequestError` type to `RequestException` to better reflect what the union type represents.
    - `RequestException` now uses the specific named exception classes instead of the generic Error class to make the type stricter.
1. Change Error thrown from `sf` to use the named `sfError` class so that users can type narrow and figure out the exact cause.

### Fixed
1. Re-formatted all internal JSDoc, to ensure that all doc comments break on column 80 for consistency.
1. Fix all the technical docs, and update them to use the latest v10 APIs.

### Added
1. Refactored `Fetch` to add the methods `useDefaultOptions` and `useDefaultHeaders`, so that the default options object and default headers array are no longer automatically injected. Requiring users to explicitly specify the intention to use any default options or headers.
    - This is done to remove hidden implicit behaviours.
1. Named error and exception classes, so that library users can easily check for failure mode using the `instanceof` operator.
1. Add utilities onto `sf` class so that it can be accessed by library users without needing to import them separately and prevent polluting the namespace on import.
    - The utilities are nested on the `sf.utils.` property.

### Others
1. Update dependencies


## [9.0.0] - 2023-05-07
[Migration guide for v8 to v9 major breaking change upgrade](./docs/v8%20to%20v9%20migration%20guide.md)

In version 9 of simpler-fetch
1. Huge big breaking changes following a API redesign, but the core functionality and project goal remains the same.
1. Library API has been drastically improved in terms of ergonomics, compile time type safety and runtime type safety.
1. All methods are now safe (does not throw).

### Main Breaking Changes
The API is now completely changed, it is better to just use the new API directly instead of migrating 1 by 1.

### Changed
1. Change the entire API to introduce support for multiple base Urls.
    1. The library now have 3 layers of configuration before every API call
        - See the `Technical Details` section in README for more details.
1. All the run method APIs
    1. Change all to return an object of type `ApiResponse<T>` so that regardless of what run method is being used, the API is uniform, and users can use the other useful properties from the raw Response object like `status` without having to manually deal with the raw Response object and parsing out required values.
1. Return a typed `RequestError` instead of a generic `Error` type to allow users to see the union of all possible error types.

### Added
1. Support setting a custom timeout value for API calls, implemented using an `AbortController`.
1. Add support for default options and default headers for each base Url using the `Builder` class.
1. Add support runtime validation!
    1. All run methods now accept optional validator functions for runtime response validation and type narrowing, to give TS users an extra layer of type safety at the runtime level directly integrated with the library instead of needing to do validation seperately themselves.
    1. The library now also exports a utility function `zodToValidator` to support the use of Zod Parsers as runtime validation functions.
1. Include Response Headers in the returned `ApiResponse<T>` object, so that users can access headers from their API service as needed while using the run methods instead of having to get the raw Response object back to parse out the headers and the value themselves.
    1. <https://stackoverflow.com/questions/43344819/reading-response-headers-with-fetch-api>
1. Add support for library users who would like to use HTTP methods like `HEAD` and `OPTIONS` through the `HTTP` method on `Builder`.

### Fixed
1. Fix `Header` type and made it stricter
    1. Force callers to pass in at least one argument to Header functions, unlike the previous version which allowed no arguments.
1. Changing the return tpye of `runJSON` method to `ApiResponse<T>` also fixes the issue where arrays returned from API services were being spread into an object which causes the caller to get an unexpectedly modified data type.
1. Make `JsonResponse` type used as the data output type of `runJSON` method to be `any` to better reflect what is returned from `.json()` parsing.

### Removed
1. Removed the `_run` method
    1. Since it did not serve any purpose for library users to have access to this underlying unsafe method.
    1. If library users would like to access the raw Response object before any modification, they can use the safe `run` method.

### Others
1. Change build strategy
    1. Change from a single source file to single dist file build output using TSC + minify, to use rollup build tool instead to support a multi source file setup, bundling and minification all with a single build tool.
1. Clean up tsconfig
1. Update all dependencies, including migrating TS to v5.
1. Deleted the sample projects for JS WebApp and Node.
    1. Delete the sample JS WebApp project since users can just reference the TS WebApp without copying over any of the type annotations.
    1. Delete the sample Node project since the TS WebApp code can be executed in node without any issues.


## [8.0.0] - 2022-09-04
[Migration guide for v7 to v8 major breaking change upgrade](./docs/v7%20to%20v8%20migration%20guide.md)

In version 8 of simpler-fetch
1. Huge big breaking changes following a API redesign, but the core functionality and project goal remains the same
1. Library API has been drastically simplified
1. Methods have been converted to be safe
1. Fix edge case bugs caused by underlying design issue with the API redesign
1. Wrote alot of docs to better document the library's behavior

### Main Breaking Changes
See the individual sections for more details
1. `_fetch` function is removed
1. All the 'run' method's API have been changed
1. `data` method is renamed and from it the `body` and `bodyJSON` methods are created

### Changed
1. Changed `run` method's API / function signature, by turning it into a safe function
    1. See also all the new 'run' methods in the 'added' section.
1. Change how the `baseUrl` is set for the entire library
    1. Change to use the `oof.setBaseURL` static method to set baseUrl instead of getting users to assign it like a object property.
1. Change the constructor's API / function signature to simplify it
    1. Because alot of the other values should be configured using the provided methods, there would be no difference between using this library and the `fetch` function directly if all the values were just directly passed in via the constructor.
    1. Therefore, all the optional parameters are removed to simplify the API.
1. Change `data` method to `body`
    1. Let users set content-type instead of forcing users to only use the `application/json` data type.
        1. See also the newly added `bodyJSON` method in the 'added' section.
1. Change how users make one off API calls without having the baseUrl prepended to the path
    1. Make users use the `once` method explicitly to indicate that the specific API call should not have the baseUrl prepended to the path, instead of relying on the heuristics of checking for http/https schemes in the URL path which does not support things like blob:// schemes.
    1. See more details in the newly added `once` method in the 'added' section.
1. Renamed `#data` to `#body` to reflect the use of the private property.
1. `_run` method have a different behavior now
    1. The behavior changes as the order of application for the RequestInit options object has been changed.
    1. The order is changed so that the single use `#options` instance variable that users set using the `options` method does not override the headers set using the `headers` method because the `headers` method is more specific and should be applied later.
        1. So that if you use both the `headers` and `options` method, the `options` value does not override the `headers` value.
1. Instance method `options` now has lesser powers because it does not override as much stuff in `_run`.
1. Remove generic type variable for the `header` method as it had no use since users cannot practically come up with a type that extends the Header type and still have it work with how the header is generated.
1. Made the `header` method a variadic function that supports passing in multiple arguments of the Header type so that users do not have to invoke the Header method multiple times.
1. Make `headers` method variadic to support setting multiple headers at once rather than invoking the `headers` method multiple times.
1. Update minification process to use a [minify](./minify.js) script to make the process more explicit.

### Added
1. Add a static constructor wrapper to support the PATCH HTTP method
1. Add `bodyJSON` method to set body data with a JS object to be stringified with `JSON.stringify`
    1. This is what the `data` method used to do, however in v7, the library assumed users only used JSON for everything.
    1. In v8, the library no longer assumes user only uses JSON and supports using other data types, which can be accepted by the `body` method.
    1. However since JSON is still one of the most popular and primary data types used for API data transfers, this dedicated `bodyJSON` method is added to simplify use of JSON data.
1. Add ['safe'](./docs/oof%20error%20handling.md) methods to simplify response body value extraction for all the different possible value types (and not just json with `runJSON`):
    1. `runText`
    1. `runBlob`
    1. `runFormData`
    1. `runArrayBuffer`
1. Support default RequestInit options object to be used for every single request to reduce duplicated code
    1. A possible use case is if you would like to make all requests use the 'cors' method, you can set it just once using `oof.defaultOptions`.
1. Add `once` method
    1. So that users can use this method to explicitly indicate that the specific API call should not have the baseUrl prepended to the path.
    1. Usually used to make a one off API request to another domain.
    1. See more details in the 'changed' section regarding 'how users make one off API calls without having the baseUrl prepended to the path'.
1. Add TS support to use the 'HEAD' HTTP method.
1. Export typescript types so that users can use it to annotate their own values first for better type safety.

### Removed
1. The previously exported `_fetch` function is now removed as it is not really used and there isn't really a need for such an abstraction when you can just use the `oof` abstraction directly.
    1. However for documentation sake, the original source code and docs for `_fetch` is still available in [archive/](./archive/_fetch/)
1. Removed the static constructor wrapper methods, `_W_DATA` and `_WO_DATA` from the `oof` class
    1. These are no longer used internally and are also not really useful for library users. Furthermore, it creates potential bugs because when using the `_W_DATA` method, it assumes that the data set with `.data()` method will be a JSON stringifiable object type even though there are many use cases for sending no 'application/json' data types.


## [7.0.2] - 2022-08-09
### Changed
1. Cleanup and misc fixes to make README more readable
1. Update README's quick start guide
1. Update dependency

### Added
1. Add README section on platforms this library supports.
1. Add sample code and documentation in sample webapp to show alternative ways to dynamically set `oof._baseUrl` when using build tools such as bundlers/vite.
1. Add docs and sample code to show how and explain why a POST request can be made without actually calling the .data method to pass in an empty object when you do not have any data to pass to the API.


## [7.0.1] - 2022-07-17
### Changed
1. Update README to include docs on using with CDN
1. Change package keywords in package.json
1. Update dependencies


## [7.0.0] - 2022-07-12
### Changed
1. Rewrote library in TypeScript for better type support.
1. Breaking change of `oof`'s static method names to save a few bytes.

### Added
1. Add generic type support for `oof` methods `header`, `data`, `runJSON`.

### Removed
1. Remove `fcf` function as it is not super useful and can be easily implemented by users if needed.


[Unreleased]: https://github.com/Jaimeloeuf/simpler-fetch/compare/v10.3.0...HEAD
[10.3.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v10.3.0
[10.2.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v10.2.0
[10.1.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v10.1.0
[10.0.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v10.0.0
[9.0.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v9.0.0
[8.0.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v8.0.0
[7.0.2]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v7.0.2
[7.0.1]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v7.0.1
[7.0.0]: https://github.com/Jaimeloeuf/simpler-fetch/releases/tag/v7.0.0