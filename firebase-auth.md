# Firebase Auth
Using firebase authentication with this library is easy as it is easy to use async function calls as header value.

## Example
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { oof } from "simpler-fetch";

// Set base URL for fetch lib
oof._baseUrl = "https://example.com";

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
 * Only returns authentication header object if user is authenticated.
 * If user is unauthenticated, this does not throw and just returns undefined.
 * @function getAuthHeader
 * @returns {object | undefined} Authentication header object or nothing.
 */
async function getAuthHeader() {
  if (auth.currentUser)
    return { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` };
}

// The function that will actually get the auth header and make the API call
async function API_call() {
  const res = await oof
    .GET("/some/end/point/that/requires/authentication")
    .header(getAuthHeader) // See section below on passing this in
    .runJSON();

  console.log(res);
}

API_call();
```


## Passing in the function
There are 2 ways `getAuthHeader` function can be used as shown below.
```javascript
// Option 1
.header(getAuthHeader)

// Option 2
.header(await getAuthHeader())
```

The main difference between the 2 options is that although option 1 is easier to write as it does not require the call to be used in an async function, in the event that an error is thrown by the `getAuthHeader` function, option 2 will generate an error stack that is less deep.