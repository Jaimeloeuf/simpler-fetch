# docs/
All technical documents for this library.


## Table of content
1.  **_<a href="./v9%20to%20v10%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v9 to v10 major breaking change upgrade</a>_**
    - This details how to migrate from v9 to v10 to handle the breaking API change, and explores the motivation behind the new API.
1.  **_<a href="./v8%20to%20v9%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v8 to v9 major breaking change upgrade</a>_**
    - This details how to migrate from v8 to v9 to handle the breaking API change, and explores the motivation behind the new API.
1.  **_<a href="./v7%20to%20v8%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v7 to v8 major breaking change upgrade</a>_** - This details how to migrate from v7 and earlier to v8 to handle the breaking API change, and explores the motivation behind the new API.
1.  [Errors vs Exceptions](./Errors%20vs%20Exceptions.md)
    - Explores the difference between Errors and Exceptions, to lay the context for the doc on Exception handling.
1.  [Exceptions handling](./Exceptions%20handling.md)
    - Explores how this library handles Exceptions and how it makes life easier for users with less code than most other libraries.
1.  Runtime response validation (these docs explore how to use various methods to do response validation at runtime to ensure that they match the types defined at compile time)
    1. [Hand written validation](./validation.md)
       - Explores how to use hand written validation functions for response validation.
       - Although possible, this is not the recommended approach, see validation with `Zod` instead.
    1. [Response validation with Zod](./validation-zod.md)
       - Explores how to use Zod for response validation using the exported parser adapter function.
1.  [firebase auth](./firebase-auth.md)
    - Documentation on integrating firebase auth with this library.
1.  [Why is fetch not exposed](./why%20is%20fetch%20not%20exposed.md)
    - Explores the reason why `fetch` is not exposed by the library unlike other HTTP client libraries.
1.  [return this](./return%20this.md)
    - Explores the reasoning for including `return this` and `return ClassName` in most methods.
1. archive/
    - Archive folder for old documentations that might still be referenced. For any details on the latest version of the library, this can be safely ignored.