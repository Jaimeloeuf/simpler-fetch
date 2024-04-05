# Migration guide for v9 to v10
See [CHANGELOG](../CHANGELOG.md) for a more specific API change history. For the most part, this is a significant breaking change, so it might be easier if you just directly learn the new API rather than trying to learn the difference to migrate.

This document explores
1. Motivation for change
1. API differences between v9 and v10
1. Examples
1. How to migrate


## Motivation
The main motivation for creating this breaking change is to make the library more ergonomic, safe, and easier to use. Where one of the main improvement is how library users can have a better error and exceptions handling experience thanks to the named error and exception classes which will allow library users to drill down on the cause of failure using the `instanceof` operator.


## Main API differences in v10
1. Rename `oof` to `sf` to better reflect the library name.
1. Require library users to use the methods `useDefaultOptions` and `useDefaultHeaders` to use the default options object and default headers array as they are no longer automatically injected.
    - This is done to remove hidden implicit behaviours.
1. `options` and `header` method is renamed to `useOptions` and `useHeader` to keep the naming consistent.
1. Exports named error and exception classes for type narrowing failure cause using `instanceof` operator.
1. All the `run` methods have been extended to take a `ErrorType` generic to cast the Response data differently if `ApiResponse.ok === false`, and to accept an optional error response parser as their last function parameter to parse the error response data type differently.

[See CHANGELOG for more details.](../CHANGELOG.md)


## Examples
[See the sample project for detailed examples.](../sample/)


## Migration
Since this is quite the big breaking change, more might be needed other than this.

1. Rename all use of `oof` to `sf`.
1. Use the `useDefaultOptions` and `useDefaultHeaders` methods for every place that you expect to use default values.
1. Use the new `useOptions` and `useHeader` methods instead of `options` and `header`.