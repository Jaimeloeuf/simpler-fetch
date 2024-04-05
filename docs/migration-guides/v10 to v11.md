# Migration guide for v10 to v11
See [CHANGELOG](../CHANGELOG.md) for a more specific API change history. Although this is a breaking change upgrade, the migration is relatively straightforward since the internals are not changed, just the public facing API.

This document explores
1. Motivation for change
1. API differences between v9 and v10
1. Examples
1. How to migrate


## Motivation
The main motivation for creating this breaking change is to make the library more easier to use within larger or more complex applications.

Where multiple API calls can be made in the same scope, and in v10, users need to manually destructure the values `err` and `res` from the object before renaming them.


## v11 API differences
1. Return type is changed to make it more ergonomic for larger or more complex applications, where multiple calls can be made in the same scope. This change allow users to easily name the destructured return values.
    1. Original return type
        ```typescript
        type OLD_ReturnType = Promise<{ res: T, err: undefined } | { res: undefined, err: RequestException }>;
        ```
        1. If there are multiple calls to the library, you need to rename res/err manually since you cant reuse the res/err names within the same scope.
    1. New return type
        ```typescript
        type NEW_ReturnType = Promise<readonly [null, T] | readonly [RequestException, null]>;
        ```
        1. The new return type is a tuple, so when destructuring it you already give it a custom name, instead of having to rename it after destructuring from an object.
        1. Something like React's useState hook, where a component can use multiple useState hooks in a row, and since tuple destructuring allow users to use any names they want, it makes it easier to use.
1. Return type is more explicit now
    1. Instead of relying on default undefined from the destructure process, it is now changed to null to be more explicit about the absence of value.
1. Return type is made safer
    1. The returned tuples are readonly so it can't be modified in userland.


## Examples
[See the sample project for detailed examples.](../sample/)


## Migration Steps
1. Replace all destructuring operations from `const { err, res } = await sf...` to `const [err, res] = await sf...`
1. Replace all `if (err !== undefined)` checks with `if (err !== null)`