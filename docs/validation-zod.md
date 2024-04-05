# Response validation with Zod
Updated on **31/05/2023** for **simpler-fetch@v10.0.0**

Zod can be used to validate what the API service responds with. This library exports a utility method to make it easier for you to use Zod parsers for Response validation.

```typescript
import { sf, zodToValidator } from "simpler-fetch";
import { z } from "zod";

async function callAPI() {
  // Expected response type from the API service
  type Todo = {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  };

  // Create a zod parser that implements the `Todo` type
  // You can choose to use the satisfies operator too starting from typescript v4.9
  const zodParser: z.ZodType<Todo> = z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    completed: z.boolean(),
  });

  // Convert a zod parser into a validator for the response data
  const validator = zodToValidator(zodParser);

  const [err, res] = await sf
    .useOnce("https://jsonplaceholder.typicode.com/todos/1")
    .GET()
    .runJSON<Todo>(validator);

  if (err !== null) {
    console.error(err);
  } else {
    // Compile time type safe AND runtime validated data structure
    console.log(res.data.id);
  }
}

callAPI();
```
