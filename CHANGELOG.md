# Changelog
All notable changes to this project from v7 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
-

## [7.0.2] - 2022-08-09
### Changed
- Cleanup and misc fixes to make README more readable
- Update README's quick start guide
- Update dependency

### Added
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


[Unreleased]: https://github.com/Enkel-Digital/simpler-fetch/compare/v7.0.2...HEAD
[7.0.2]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.2
[7.0.1]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.1
[7.0.0]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.0