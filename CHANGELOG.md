# Changelog
- All notable changes to this project starting from v7 is documented in this file.
- The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [8.0.0] - 2022-09-04
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


[Unreleased]: https://github.com/Enkel-Digital/simpler-fetch/compare/v8.0.0...HEAD
[8.0.0]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v8.0.0
[7.0.2]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.2
[7.0.1]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.1
[7.0.0]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.0