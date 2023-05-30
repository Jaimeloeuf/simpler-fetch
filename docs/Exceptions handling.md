# Exceptions handling
Exceptions handling in libraries like `axios v0.27.2` and `superagent v8.0.0` means writing boilerplate code yourself to catch any exceptions that bubbles up / get thrown. This makes their method calls 'unsafe' in the sense that you either spend alot of time writing boilerplate code over and over again yourself or let the exception bubble up somewhere else in the control flow which could make things much harder to debug and break your applications in unexpected ways.

This article only applies to exceptions, and errors, specifically `oofError` can still be thrown. See [Errors vs Exceptions](../../docs/Errors%20vs%20Exceptions.md) for more details on the differences.


## Motivation
In version 7 and earlier, `oof` was doing the exact same thing as these libraries, but after using this library for sometime, I realise that it is extremely frustrating to either constantly write hard to reason about control flows for exceptions handling or live with the risk of uncaught exceptions by just ignoring it.

That is when I decided to redesign the library to handle exceptions nicely. Looking around, I realise I really enjoyed writing code in Rust and Go, because exceptions are treated just like any other values and are handled sequentially, rather than using some special control flow effect like JavaScript's try/catch.

This is why after experimenting with a few ways of doing things, I decided on a way to handle exceptions very similar to how Go lang does it with the help of TypeScript, where exceptions are just values returned from the method calls, and they are handled **sequentially** right after the method call. Users do not need to worry about the code's control flow jumping about everywhere for example to the nearest `catch` method or the nearest `catch` block!

This makes exception handling much more pleasant and makes the overall code much easier to reason about thanks to its more sequential nature.


## Examples
In v7 of the library, although it looks nice to write code with `.then` and `.catch` methods, it is not very easy to do exception handling because of the different scope levels and the fact that there may be exceptions in `.then` too.

### This is how the library is used in v7
```typescript
await oof
  .GET("/test")
  .runJSON()
  .then((res) => console.log("Res", res)) // 1
  .catch((err) => console.exception(err)); // 2
```

In part 1 the `.then` method's anonymous function gets the response back from the API server, and in part 2 the `.catch` method's anonymous function gets the exception if any is thrown by the `runJSON` method.

The problem with this approach is that we assume that all exceptions will be thrown, and all exceptions are handled in the `.catch` method's anonymous function accordingly.

However, this is not the case because only exceptions thrown by `fetch` or `runJSON`'s processing will be caught by the `.catch` method's anonymous function. This does not take into account the exceptions that are returned from the API server which are not thrown as they are user exceptions and not network request exceptions. The exceptions that are caught are most likely [these type of exceptions](https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions).

This means that the user have to handle exceptions at 2 places, in both the `.then` and `.catch` methods, often with duplicated code. This causes more issues too as the exceptions are handled in 2 different lexical scope which means that it is harder to share values or break out of the function.

### Wrong way to handle exceptions as the `return` statements do not meaningfully break the user out of the function.
```typescript
async function getData() {
  oof
    .GET("https://example.com/api")
    .runJSON()
    .then((res) => {
      // If the API server returned an exception, handle it here by
      // showing users the exception and asking if they want to retry.
      // Recursively call itself again if user wants to retry,
      // and make sure this method call ends here by putting it
      // in a return expression so that it does not continue to
      // execute after the recursive call.
      if (!res.ok)
        return confirm(`exception: \n${res.exception}\n\nTry again?`) && getData();

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

### Handle exceptions correctly but with duplicated code and lots of boilerplate
```typescript
async function getData() {
  try {
    const res = await oof.GET("https://example.com/api").runJSON();

    // If the API server returned an exception, handle it here by
    // showing users the exception and asking if they want to retry.
    // Recursively call itself again if user wants to retry,
    // and make sure this method call ends here by putting it
    // in a return expression so that it does not continue to
    // execute after the recursive call.
    if (!res.ok)
      return confirm(`exception: \n${res.exception}\n\nTry again?`) && getData();

    // Do something with the data
    console.log(res.data);
  } catch (error) {
    console.error(error);
    return confirm(`Error: \n${error}\n\nTry again?`) && getData();
  }
}
```

### v8 exception handling
As we saw from the last 2 examples, once your application needs to do any form of proper exception handling, it becomes alot more complex compared to the simple example shown as you would have to deal with both API server and `fetch` API exceptions seperately.

In v8, although you still have to deal with both exception types seperately, you can do so in the same scope level and do so sequentially instead of having control flow jumps (exceptions thrown and caught by try/catch blocks).

The improved exception handling experience
```typescript
async function getData() {
  const { res, err } = await oof
    .useOnce("https://example.com/api")
    .GET()
    .runJSON()

  // exceptions can now be handled together if you wish to,
  // if not you can handle them one by one too and treat
  // them differently, but regardless, this removes the
  // need to use the try/catch block!
  if (err || !res?.ok)
    return confirm(`Try again?`) && getData();

  // Do something with the data
  console.log(res.data);
}
```

### v8, TypeScript and exception handling
With v8, TypeScript support has been improved, with type definitions that helps with type narrowing automatically.

```typescript
async function getData() {
  type ResponseType = { someValue: string };
  
  const { res, err } = await oof
    .useOnce("https://example.com/api")
    .GET()
    .runJSON<ResponseType>(); // Type the response

  // Check if there are any exceptions
  if (err) {
    // type narrow `err` from `RequestException | undefined` to `RequestException`
    console.error("err", err);

    // `res` will be type narrowed from `ResponseType | undefined` to `undefined`
    console.log("res", res);

    // Break out of the function after handling exception
    return;
  }

  // If `err` is undefined, that means that there was a valid response returned
  // `res` will be type narrowed from `ResponseType | undefined` to `ResponseType`
  console.log(res);
}
```