# Migration guide for v7 to v8
See [CHANGELOG](../CHANGELOG.md) for a more specific API change history. For the most part, this is a significant breaking change, so it might be easier if you just learnt the new API directly rather than trying to migrate the APIs one by one.

This document explores
1. Motivation for change
1. The API difference between v7 and v8
1. Why is v8 better
1. How to migrate


## Motivation
The main motivation for creating this breaking change is to make the library more ergonomic with better error handling.

See [oof error handling](./oof%20error%20handling.md) as it explores how `oof` deals with Error handling and why it helps you (library users) better handle errors with less code than most other libraries. Here is a sample excerpt.

In v7 of the library, although it looks nice to write code with `.then` and `.catch` methods, it is not very easy to do error handling because of the different scope levels and the fact that there may be errors in `.then` too.

### This is how the library is used in v7
```javascript
await oof
  .GET("/test")
  .runJSON()
  .then((res) => console.log("Res", res)) // 1
  .catch((err) => console.error(err)); // 2
```

In part 1 the `.then` method's anonymous function gets the response back from the API server, and in part 2 the `.catch` method's anonymous function gets the error if any is thrown by the `runJSON` method.

The problem with this approach is that we assume that all errors will be thrown, and all errors are handled in the `.catch` method's anonymous function accordingly.

However, this is not the case because only errors thrown by `fetch` or `runJSON`'s processing will be caught by the `.catch` method's anonymous function. This does not take into account the errors that are returned from the API server which are not thrown as they are user errors and not network request errors. The errors that are caught are most likely [these type of errors](https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions).

This means that the user have to handle errors at 2 places, in both the `.then` and `.catch` methods, often with duplicated code. This causes more issues too as the errors are handled in 2 different lexical scope which means that it is harder to share values or break out of the function.

### Wrong way to handle errors as the `return` statements do not meaningfully break the user out of the function.
```javascript
async function getData() {
  oof
    .GET("https://example.com/api")
    .runJSON()
    .then((res) => {
      // If the API server returned an error, handle it here by
      // showing users the error and asking if they want to retry.
      // Recursively call itself again if user wants to retry,
      // and make sure this method call ends here by putting it
      // in a return expression so that it does not continue to
      // execute after the recursive call.
      if (!res.ok)
        return confirm(`Error: \n${res.error}\n\nTry again?`) && getData();

      // Do something with the data
      console.log(res.data);
    })
    .catch((error) => {
      console.error(error);
      return confirm(`Error: \n${error}\n\nTry again?`) && getData();
    });

  // Some other code to run
  console.log("something");

  // The `return` expressions in `.then` and `.catch` anonymous functions
  // cannot prevent the above code from running as they just exits from
  // anonymous functions only, and not the outer `getData` function.
}
```

### Handle errors correctly but with duplicated code and lots of boilerplate
```javascript
async function getData() {
  try {
    const res = await oof.GET("https://example.com/api").runJSON();

    // If the API server returned an error, handle it here by
    // showing users the error and asking if they want to retry.
    // Recursively call itself again if user wants to retry,
    // and make sure this method call ends here by putting it
    // in a return expression so that it does not continue to
    // execute after the recursive call.
    if (!res.ok)
      return confirm(`Error: \n${res.error}\n\nTry again?`) && getData();

    // Do something with the data
    console.log(res.data);
  } catch (error) {
    console.error(error);
    return confirm(`Error: \n${error}\n\nTry again?`) && getData();
  }
}
```

### v8 error handling
As we saw from the last 2 examples, once your application needs to do any form of proper error handling, it becomes alot more complex compared to the simple example shown as you would have to deal with both API server and `fetch` API errors seperately.

In v8, although you still have to deal with both error types seperately, you can do so in the same scope level and do so sequentially instead of having control flow jumps (errors thrown and caught by try/catch blocks).

The improved error handling experience
```javascript
async function getData() {
  const { res, err } = await oof.GET("https://example.com/api").runJSON();

  // Errors can now be handled together if you wish to,
  // if not you can handle them one by one too and treat
  // them differently, but regardless, this removes the
  // need to use the try/catch block!
  if (err || !res?.ok)
    return confirm(`Error: \n${error}\n\nTry again?`) && getData();

  // Do something with the data
  console.log(res.data);
}
```

### v8, TypeScript and error handling
With v8, TypeScript support has been improved, with type definitions that helps with type narrowing automatically.

```typescript
async function getData() {
  type ResponseType = { someValue: string };
  
  const { res, err } = await oof
    .GET("https://example.com/api")
    .runJSON<ResponseType>(); // Type the response

  // Check if there are any errors
  if (err) {
    // `err` will be type narrowed from `Error | undefined` to `Error`
    console.error("err", err);

    // `res` will be type narrowed from `ResponseType | undefined` to `undefined`
    console.log("res", res);

    // Break out of the function after handling error
    return;
  }

  // If `err` is undefined, that means that there was a valid response returned
  // `res` will be type narrowed from `ResponseType | undefined` to `ResponseType`
  console.log(res);
}
```


## Skipping `baseUrl`
The new API requires users to explicitly call the `.once` method in order to skip the baseUrl, when making API requests to other domains, instead of relying on the past heuristics of checking for 'http' and 'https' schemes. The reason for this change is to make it more explicit and less error prone.

Previously in v7, users relied on the heuristics to make an API call without the baseUrl prepended
```javascript
async function getData() {
  const { res, err } = await oof
    .GET("https://example.com/api")
    .runJSON();

  console.log(res, err);
}
```

Now in v7, users have to explicitly call the `.once` method to specify a once off API call without the baseUrl prepended
```javascript
async function getData() {
  const { res, err } = await oof
    .GET("https://example.com/api")
    .once() // Explicitly specify that 'baseUrl' should be skipped for this call
    .runJSON();

  console.log(res, err);
}
```