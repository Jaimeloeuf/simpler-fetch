# Changelog
All notable changes to this project from v7 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
-

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


[Unreleased]: https://github.com/Enkel-Digital/simpler-fetch/compare/v7.0.1...HEAD
[7.0.1]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.1
[7.0.0]: https://github.com/Enkel-Digital/simpler-fetch/releases/tag/v7.0.0