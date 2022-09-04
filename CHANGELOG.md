# Changelog
All notable changes to this project from v7 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [8.0.0] - 2022-09-04
In version 8 of simpler-fetch
- Huge big breaking changes following a API redesign, but the core functionality and project goal remains the same
- Library API has been drastically simplified
- methods have been converted to be safe
- Fix edge case bugs caused by underlying design issue with the API redesign
- Wrote alot of docs to better document the library's behavior

### Main Breaking Changes
See the individual sections for more details
- `_fetch` function is removed
- All the 'run' method's API have been changed
- `data` method is renamed and from it the `body` and `bodyJSON` methods are created

### Changed
- Changed `run` method's API / function signature, by turning it into a safe function
    - See also all the new 'run' methods in the 'added' section.
- Change how the `baseUrl` is set for the entire library
    - Change to use the `oof.setBaseURL` static method to set baseUrl instead of getting users to assign it like a object property.
- Change the constructor's API / function signature to simplify it
    - Because alot of the other values should be configured using the provided methods, there would be no difference between using this library and the `fetch` function directly if all the values were just directly passed in via the constructor.
    - Therefore, all the optional parameters are removed to simplify the API.
- Change `data` method to `body`
    - Let users set content-type instead of forcing users to only use the `application/json` data type.
        - See also the newly added `bodyJSON` method in the 'added' section.
- Change how users make one off API calls without having the baseUrl prepended to the path
    - Make users use the `once` method explicitly to indicate that the specific API call should not have the baseUrl prepended to the path, instead of relying on the heuristics of checking for http/https schemes in the URL path which does not support things like blob:// schemes.
    - See more details in the newly added `once` method in the 'added' section.
- Renamed `#data` to `#body` to reflect the use of the private property.
- `_run` method have a different behavior now
    - The behavior changes as the order of application for the RequestInit options object has been changed.
    - The order is changed so that the single use `#options` instance variable that users set using the `options` method does not override the headers set using the `headers` method because the `headers` method is more specific and should be applied later.
        - So that if you use both the `headers` and `options` method, the `options` value does not override the `headers` value.
- Instance method `options` now has lesser powers because it does not override as much stuff in `_run`.
- Remove generic type variable for the `header` method as it had no use since users cannot practically come up with a type that extends the Header type and still have it work with how the header is generated.
- Made the `header` method a variadic function that supports passing in multiple arguments of the Header type so that users do not have to invoke the Header method multiple times.
- Make `headers` method variadic to support setting multiple headers at once rather than invoking the `headers` method multiple times.
- Update minification process to use a [minify](./minify.js) script to make the process more explicit.

### Added
- Add a static constructor wrapper to support the PATCH HTTP method
- Add `bodyJSON` method to set body data with a JS object to be stringified with `JSON.stringify`
    - This is what the `data` method used to do, however in v7, the library assumed users only used JSON for everything.
    - In v8, the library no longer assumes user only uses JSON and supports using other data types, which can be accepted by the `body` method.
    - However since JSON is still one of the most popular and primary data types used for API data transfers, this dedicated `bodyJSON` method is added to simplify use of JSON data.
- Add ['safe'](./docs/oof%20error%20handling.md) methods to simplify response body value extraction for all the different possible value types (and not just json with `runJSON`):
    - `runText`
    - `runBlob`
    - `runFormData`
    - `runArrayBuffer`
- Support default RequestInit options object to be used for every single request to reduce duplicated code
    - A possible use case is if you would like to make all requests use the 'cors' method, you can set it just once using `oof.defaultOptions`.
- Add `once` method
    - So that users can use this method to explicitly indicate that the specific API call should not have the baseUrl prepended to the path.
    - Usually used to make a one off API request to another domain.
    - See more details in the 'changed' section regarding 'how users make one off API calls without having the baseUrl prepended to the path'.
- Add TS support to use the 'HEAD' HTTP method.
- Export typescript types so that users can use it to annotate their own values first for better type safety.

### Removed
- The previously exported `_fetch` function is now removed as it is not really used and there isn't really a need for such an abstraction when you can just use the `oof` abstraction directly.
    - However for documentation sake, the original source code and docs for `_fetch` is still available in [archive/](./archive/_fetch/)
- Removed the static constructor wrapper methods, `_W_DATA` and `_WO_DATA` from the `oof` class
    - These are no longer used internally and are also not really useful for library users. Furthermore, it creates potential bugs because when using the `_W_DATA` method, it assumes that the data set with `.data()` method will be a JSON stringifiable object type even though there are many use cases for sending no 'application/json' data types.


## [7.0.2] - 2022-08-09
### Changed
- Cleanup and misc fixes to make README more readable
- Update README's quick start guide
- Update dependency

### Added
- Add README section on platforms this library supports.
- Add sample code and documentation in sample webapp to show alternative ways to dynamically set `oof._baseUrl` when using build tools such as bundlers/vite.
- Add docs and sample code to show how and explain why a POST request can be made without actually calling the .data method to pass in an empty object when you do not have any data to pass to the API.


## [7.0.1] - 2022-07-17
### Changed
- Update README to include docs on using with CDN
- Change package keywords in package.json
- Update dependencies


## [7.0.0] - 2022-07-12
### Changed
- Rewrote library in TypeScript for better type support.
- Breaking change of `oof`'s static method names to save a few bytes.

### Added
- Add generic type support for `oof` methods `header`, `data`, `runJSON`.

### Removed
- Remove `fcf` function as it is not super useful and can be easily implemented by users if needed.


[Unreleased]: https://github.com/Enkel-Digital/simpler-fetch/compare/v8.0.0...HEAD
[8.0.0]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v8.0.0
[7.0.2]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.2
[7.0.1]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.1
[7.0.0]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.0