# Firebase Auth
Using firebase authentication with this library is easy as it is easy to use async function calls as header value.

## Example
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { oof } from "simpler-fetch";

// Set base URL for fetch lib
oof._baseUrl = "https://example.com";

// Sample firebaseConfig used
// Find yours in project settings
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

async function API_call() {
  const res = await oof
    .GET("/some/end/point/that/requires/authentication")
    .header(await getAuthHeader())
    .runJSON();

  console.log(res);
}

API_call();
```