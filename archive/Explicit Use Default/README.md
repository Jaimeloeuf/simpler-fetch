# Explicit Use Default
This is an archive of an experiment where a `useDefaultOptions` or `useDefaultHeaders` method must be called on the `Builder` class for the default options or headers to be passed into the new fetch instance.

Problem with this is way is that although it works, there can be edge cases that cause difficult to trace bugs. This is because there is a single Builder instance for every single base Url, and if the `useDefaultHeaders` is called for example without actually calling the `HTTP` method, the flag will not get reset and cause subsequent use of the same Base URLs to include the default headers even though they did not explicitly specify it.

Example
```typescript
// Set a default header for the default base Url.
oof.useDefault().setDefaultHeaders({ "default-headers": "true" });

// This is supposed to only affect this particular API call,
// but since the `useDefaultHeaders` is called, and no HTTP
// method is chained to it, the `useDefaultHeaders` flag is
// not cleared.
oof.useDefault().useDefaultHeaders();

// Any subsequent API calls will end up including the default
// headers even though it did not explicitly specify for it.
// And this can be the cause of many bugs.
oof.useDefault().GET("/test").runJSON();
```