# docs
All technical documents for this library.


## Table of content
- ***<a href="./v8%20to%20v9%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v8 to v9 major breaking change upgrade</a>***
    - This details how to migrate from v8 to v9 to handle the breaking API change, and explores the motivation behind the new API.
- ***<a href="./v7%20to%20v8%20migration%20guide.md" target="_blank" style="color: red">Migration guide for v7 to v8 major breaking change upgrade</a>***
    - This details how to migrate from v7 and earlier to v8 to handle the breaking API change, and explores the motivation behind the new API.
- [Main API documentation for `oof`](./index.md)
- [oof error handling](./oof%20error%20handling.md)
    - Explores how `oof` deals with Error handling and why it helps you (library users) better handle errors with less code than most other libraries.
- [firebase auth](./firebase-auth.md)
    - Documentation on integrating firebase auth with this library.
- [return this](./return%20this.md)
    - Explores the reasoning for including `return this` and `return ClassName` in most methods.
- [Why is fetch not exposed](./why%20is%20fetch%20not%20exposed.md)
    - Explores the reason why `fetch` is not exposed by the library unlike other HTTP client libraries.
- [Response validation with Zod](./validation-zod.md)
    - Explores how to use Zod for response validation using the exported parser adapter function.