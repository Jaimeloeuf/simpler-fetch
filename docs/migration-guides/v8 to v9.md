# Migration guide for v8 to v9
See [CHANGELOG](../CHANGELOG.md) for a more specific API change history. For the most part, this is a significant breaking change, so it might be easier if you just directly learn the new API rather than trying to learn the difference to migrate.

This document explores
1. Motivation for change
1. The API difference between v8 and v9
1. Why is v9 better
1. How to migrate


## Motivation
The main motivation for creating this breaking change is to make the library more ergonomic, safe, and easier to use in bigger projects (with multiple API base Urls).


## API differences in v9
1. v9 supports bigger webapps that have multiple endpoints say, <https://api.example.com> and <https://billing-api.example.com> and <https://api.vendor.com> if they are not using an API gateway like kong which aggregates all into a single <https://api.example.com>
    - This also applies for versioning! Instead of making every single API call specify the version in text, you can have multiple base Urls,one for each version.
1. Instead of having to specify a header function for auth header generation for every single API call, you can specify it to be a default header function, which will apply to all API calls with the same base Url.
1. Improve the API response value to expose more data useful for more complex projects, such as the Response headers.
1. Custom timeout value for API calls.
1. ***Response Validation*** is now supported, so that the response value can be type safe both at compile time and runtime!


### Multiple Base Urls
In v8 of the library, you could only set a single base Url, so it becamse clunky when your project gets bigger and wants to support versioning for example.

#### v8 with multiple base Urls
```typescript
oof.setBaseUrl("https://api.example.com/v1")

// Using the default base Url 
const { res, err } = await oof
    .GET("/test")
    .runJSON();

// To use v2 of the API
const { res, err } = await oof
    .GET("https://api.example.com/v2/test")
    .once()
    .runJSON();
```

#### v9 with multiple base Urls
```typescript
 oof
    .addBase("v1", "https://api.example.com/v1")
    .addBase("v2", "https://api.example.com/v2")
    // Set v1 as the default base url
    .setDefault("v1");

// Using the default base Url 
const { res, err } = await oof
    .useDefault()
    .GET("/test")
    .runJSON();

// To use v2 of the API
// This is alot more uniform to using the v1 API without much change.
const { res, err } = await oof
    .useBase("v2")
    .GET("/test")
    .runJSON();
```

### Response Validation
Response Validation is now supported, so that the response value can be type safe both at compile time and runtime!

#### v8 with compile time type safety only
```typescript
type Todo = { id: number; value: string; completed: boolean };

const { res, err } = await oof
    .useOnce("https://api.example.com/todo/1")
    .GET()
    .runJSON<Todo>();

if (err !== undefined) {
    // At compile time, we assume this to be typed as `Todo`
    // But there is no runtime guarantees and can cause errors if used directly
    // So usually, you have to do your own validation here again.
    console.log(res);
}
```

#### v8 with compile time AND runtime type safety
This example uses `Zod` but you can use any other validation / parsing library or even a custom hand written validation function too.
```typescript
import { oof, zodToValidator } from "simpler-fetch";
import { z } from "zod";

type Todo = { id: number; value: string; completed: boolean };

const { res, err } = await oof
    .useOnce("https://api.example.com/todo/1")
    .GET()
    .runJSON<Todo>(
        // Pass in a Zod validator to do response validation
        zodToValidator(
            z.object({
                id: z.number(),
                value: z.string(),
                completed: z.boolean(),
            })
        )
    );

if (err !== undefined) {
    // `res` can be assumed to be type safe at both compile and runtime now!
    // It is guarunteed to be safe at runtime by the zod validation function
    // If it fails validation, an `err` will be returned instead.
    console.log(res);
}
```


## How to migrate
Seeing as this is quite the significant API change, it is easier to just rewrite API calls instead.