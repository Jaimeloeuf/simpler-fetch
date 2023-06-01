# Response validation with Validator functions
Updated on **1/06/2023** for **simpler-fetch@v10.0.0**

You can write validation functions to do runtime response validation.

```typescript
import { sf } from "simpler-fetch";

async function callAPI() {
  // Expected response type from the API service
  type Todo = {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  };

  const validator = (obj: any): obj is Todo =>
    typeof obj.userId === "number" &&
    typeof obj.id === "number" &&
    typeof obj.title === "string" &&
    typeof obj.completed === "boolean";

  const { res, err } = await sf
    .useOnce("https://jsonplaceholder.typicode.com/todos/1")
    .GET()
    .runJSON<Todo>(validator);

  if (err !== undefined) {
    console.error(err);
  } else if (res.ok) {
    // Compile time type safe AND runtime validated data structure
    console.log(res.data.id);
  }
}

callAPI();
```

Although this is fine, this is not the recommended way since it can be quite error prone. Imagine a situation where the type predicate just returns true regardless. This will make your runtime validation useless.
```typescript
import { sf } from "simpler-fetch";

async function callAPI() {
  // Expected response type from the API service
  type Todo = {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  };

  // Returns true no matter what!
  const validator = (obj: any): obj is Todo => true;

  const { res, err } = await sf
    .useOnce("https://jsonplaceholder.typicode.com/todos/1")
    .GET()
    .runJSON<Todo>(validator);

  if (err !== undefined) {
    console.error(err);
  } else if (res.ok) {
    // Compile time type safe AND runtime validated data structure
    console.log(res.data.id);
  }
}

callAPI();
```

Therefore, this way of handwriting validation functions is not recommended. Instead use a validation library like `Zod`. See docs on using [`Zod`](./validation-zod.md) instead.