# Firebase Auth
Updated on **31/05/2023** for **simpler-fetch@v10.0.0**

Using firebase authentication with this library is easy as it is easy to use async function calls as header value.

## Example
```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { sf } from "simpler-fetch";

// Sample firebaseConfig used, find yours in your firebase project settings
const firebaseApp = initializeApp({
  apiKey: "AIzaBAjrSyxBg5cSEg-AdO_svXmV7d7XqkxNgMf",
  authDomain: "example.firebaseapp.com",
  projectId: "example",
  storageBucket: "example.appspot.com",
  messagingSenderId: "438986025363",
  appId: "1:534908682363:web:8fcb25cd34822bc5595e97",
});
const auth = getAuth(firebaseApp);

/**
 * Get authentication header if user is authenticated.
 * Will not throw if user is unauthenticated,
 * it just returns `{ Authorization: 'Bearer undefined' }`
 */
const getAuthHeader = async () => ({
  Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
});

// The function that will actually get the auth header and make the API call
async function API_call() {
  const { res, err } = await sf
    .useOnce('https://example.com/end-point-that-requires-auth')
    .GET()
    .useHeader(getAuthHeader) // See section below on passing this in
    .runJSON();

  // Quit function if the API call failed
  if (err) return console.error(err);

  // Else do something
  console.log(res);
}

API_call();
```


## Passing in the function
There are 2 ways `getAuthHeader` function can be used as shown below.
```typescript
// Option 1
.useHeader(getAuthHeader)

// Option 2
.useHeader(await getAuthHeader())
```

Differences:
1. The main difference between the 2 options is that in option 1, the function will only run when the API call is actually made. This means that the token is only generated right before the API call is made. Whereas in option 2, the header with the token is generated at the call site before passing it in. The implication for this is that if your token is really really really short lived, it is best if you generate it as close as possible to the time of making the API call to prevent it from being expired by the time the request reaches your API server.
1. Although option 1 is easier to write as it does not require the call to be used in an async function, in the event that an error is thrown by the `getAuthHeader` function, option 2 will generate an error stack that is less deep. This really should not affect much users unless you really need a specific stack trace from it?