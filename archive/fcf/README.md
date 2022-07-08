# fcf
In older versions of this library, there was another abstraction on top of `_fetch` built for functional programming. But because it was not very practical and generally not really used. This folder stores the original documentation for it and the source code.

## fcf
fcf: Functional, Curried, Fetch abstraction over `_fetch`.
This is for users who prefer a more functional approach to building API data before calling the API.

```javascript
import { fcf } from "simpler-fetch";

(async function () {
  const fetch = fcf("http://localhost:3000");

  const response = await fetch("/test")({
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      randomHeader: true,
      anotherHeader: "value",
      lastHeader: 1,
    },
  })({ test: true, anotherTest: "testing" }).then((response) =>
    response.json()
  );

  console.log("Response", response);
})();
```
