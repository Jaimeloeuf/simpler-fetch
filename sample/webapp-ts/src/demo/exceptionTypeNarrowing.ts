import { sf } from "../sf.js";
import { HeaderException } from "simpler-fetch";

export default [
  {
    title: "Demo exception type narrowing to figure out the root cause",
    async fn() {
      class MyCustomError extends Error {}

      const [err] = await sf
        .useBaseUrl("v1")
        .GET("/test")
        .useHeader(async () => {
          throw new MyCustomError("some error");
        })
        .runJSON();

      // Type narrow `err` to RequestException
      if (err !== null) {
        // Type narrow `err` to HeaderException
        if (err instanceof HeaderException) {
          // Type narrow `err` to MyCustomError
          if (err.error instanceof MyCustomError) {
            console.log("Error successfully type narrowed");
            console.error(err);
          }
        }
      }
    },
  },
];
