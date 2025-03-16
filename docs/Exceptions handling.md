# Exceptions handling
Updated on **31/05/2023** for **simpler-fetch@v10.0.0**

Exceptions handling in other libraries like `axios v1.4.0` and `superagent v8.0.9` means writing boilerplate code yourself to catch any exceptions that bubbles up / get thrown. This makes their method calls 'unsafe' in the sense that you either spend alot of time writing boilerplate code over and over again yourself or let the exception bubble up somewhere else in the control flow which could make things much harder to debug and break your applications in unexpected ways.

This doc showcases how `simpler-fetch` handles exceptions differently from these other libraries.

**NOTE** This article only applies to exceptions, and errors, specifically `sfError` can still be thrown. See [Errors vs Exceptions](./Errors%20vs%20Exceptions.md) for more details on the differences. `sfError` is supposed to be thrown to bring visibility to the error as it is deemed unrecoverable during run time as it is most likely a library user configuration / setup issue.


## Motivation
Most API libraries like `axios` and `superagent` throw both errors and exceptions, but after using this pattern for sometime I get extremely frustrated to constantly write hard to reason about control flows for exceptions handling or live with the risk of uncaught exceptions by just ignoring it. That is when I decided to redesign my own API library to handle exceptions nicely since `simpler-fetch@8.0.0`.

Looking around, I really enjoyed writing code in Rust and Go, because exceptions are treated just like any other values and they are handled sequentially rather than doing some non-linear control flow like JavaScript's try/catch.

This is why after experimenting with a few ways of doing things, I decided on a way to handle exceptions very similar to how Go and Rust does it with the help of TypeScript, where **exceptions are just values** returned from the method calls, and they are handled **sequentially** right after the method call. Users do not need to worry about the code's control flow jumping about everywhere e.g. to the nearest `catch` method or the nearest `catch` block!

This makes exception handling much more pleasant and makes the overall code much easier to reason about thanks to its more sequential nature. Enough talk, lets see some examples.


## Axios Example
This is the recommended way to do error handling in `axios`.

```typescript
async function getData() {
  axios.get('/user/12345')
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      if (error.response) {
        // If request was made and server responded with a status code > 299
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and
        // an instance of http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
    });
}
```

The default way is to handle the error in a callback function passed to `.catch`. The problem with this is that it is hard to handle exceptions because of the different scope levels and the fact that there may be exceptions in `.then` too, such as the server responding with invalid data.

This means that the user have to handle exceptions at 2 places, in both the `.then` and `.catch` methods, often with duplicated code. This causes more issues too as the exceptions are handled in 2 different lexical scope which means that it is harder to share values or break out of the `getData` function entirely from within the callback functions.

And if you throw any errors in `.then` you need to figure out how to handle it in `.catch` and test for the exact error type that you have thrown.

---

The other issue with this approach is that it treats HTTP status codes bigger than 299 as errors, and allow you to customize with the config option, where you can define HTTP code(s) that should throw an error. The problem with this is that this makes you mix all types of exceptions together, meaning you have to deal with a DNS lookup failure and a data Not Found exception at the same level even though they are clearly 2 different categories of errors.

```typescript
async function getData() {
  axios.get('/user/12345', {
    validateStatus: function (status) {
      return status < 500; // Resolve only if the status code is less than 500
    }
  })
}
```

---

Axios can be used with async/await but this requires you to write try/catch boilerplate code everywhere
```typescript
async function getData() {
  try {
    const res = await axios.get('/user/12345');
    console.log(res);
    
  } catch (error) {
    console.error(error);
  }
}
```

Despite needing the try/catch boilerplate, this still seems relatively simple, but what most people forget is that you still need to deal with other types of exceptions!
```typescript
async function getData() {
  try {
    const res = await axios.get('/user/12345');
    
    // This is a usage exception and not an API failure
    if (res.status === 404) {
      throw new NotFoundException('User not found')
    }

    // Any retry logic written here is most likely duplicated in the `catch`
    // block too so that errors over there can also cause a retry.

  } catch (error) {
    // Over here, you need to deal with both API call failure AND user defined
    // exceptions such as `NotFoundException` and might be harder since it is
    // all nested in the catch block.
    console.error(error);

  // Any retry logic is duplicated here
  }
}
```

This way of structuring it makes it harder to read the code and reason about the logic since it is non-linear / non-sequential and relies on JavaScript's jumpy control flow of throwing and try/catch mechanisms.


## Superagent Example
This is the recommended way to do error handling in `superagent`.

```typescript
async function getData() {
  superagent
    .post('/api/pet')
    .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
    .set('X-API-Key', 'foobar')
    .set('accept', 'json')
    .end(function (err, res) {
      // Calling the end function will send the request
    });
}
```

Similar to the `axios` example, the way this handles exceptions and errors is by making the library user deal with it in a callback function, which limits how they can deal with these errors since they cannot escape out of the getData function.

And if using async/await, it still faces pretty much the same type of issues as `axios` where it relies on the non-linear / non-sequential nature of the throw + try/catch control flow. So although its API is slightly different, the way they handle exceptions and errors is quite similar in this regard.


## simpler-fetch exception handling
As we saw from the previous examples, once your application needs to do any form of proper exception handling, it becomes alot more complex compared to the simple example shown as you would have to deal with both API server / user level exceptions and `fetch` API exceptions seperately.

In simpler-fetch, although you still have to deal with both exception types seperately, you can do so in the same scope level and do so sequentially instead of having control flow jumps (exceptions thrown and caught by try/catch blocks).

And with added TypeScript support that can help you type narrowing automatically.

The improved exception handling experience
```typescript
import { sf, ValidationException } from 'simpler-fetch';

async function getData() {
  type MyResponse = { someValue: string };

  // Allows you to specify an optional runtime response validator to validate
  // response type so that it is valid during both compile and run time.
  // If none is specified, it will just cast the response to `MyResponse`
  //
  // See validation docs for more usage details and advanced use cases / integrations.
  const validator = (data: unknown): data is MyResponse =>
    typeof (data as any)?.someValue === "string";
  
  // Exceptions are ALWAYS returned, they are NEVER THROWN!!!
  // Therefore, you do not need any try/catch blocks and can write code sequentially
  const [err, res] = await sf
    .useFullUrl("https://example.com/api")
    .GET()
    .runJSON<MyResponse>(validator); // Typed response with optional runtime validation

  // Check if there are any exceptions
  if (err !== null) {
    // type narrow `err` from `RequestException | null` to `RequestException`
    console.error("err", err);

    // `res` will be type narrowed from `ApiResponse<MyResponse> | null` to `null`
    console.log("res", res);

    // Check for specific Exception type
    if (err instanceof TypeError) {
      console.log("Failed to make API call");
    }
    else if (err instanceof ValidationException) {
      console.log("Invalid response from API server");
    }

    // Break out of the function after handling exception
    return;
  }

  // If `err` is null, that means that there was a valid response returned
  // `res` will be type narrowed from `ApiResponse<MyResponse> | null` to `ApiResponse<MyResponse>`
  console.log(res.ok); // `Response.ok` boolean will be true if HTTP status < 300
  console.log(res.status); // HTTP status code
  console.log(res.data); // Data returned from API server, parsed as JSON and validated to be MyResponse
}
```