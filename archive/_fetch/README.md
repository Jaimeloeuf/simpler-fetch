# _fetch
In older versions of this library, there was another abstraction on top of the `fetch` API built to simplify its function API. But because it was not very practical and generally not really used over the `oof` class, it has now been removed from the code base and archived. This folder stores the original documentation for it and the source code.

## _fetch
Simple fetch abstraction over the fetch API and does body stringification if needed.

This is the bare minimum abstraction and it's used by `oof` under the hood, **do not use this** unless you have a very specific use case. The `oof` abstraction is alot nicer to work with.

***Edit: `oof` does not use this anymore, it calls the native fetch API directly!***

```javascript
import { _fetch } from "simpler-fetch";

(async function () {
  const response = await _fetch(
    "http://localhost:3000/test",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        randomHeader: true,
        anotherHeader: "value",
        lastHeader: 1,
      },
    },
    { test: true, anotherTest: "testing" }
  ).then((response) => response.json());

  console.log("Response", response);
})();
```
