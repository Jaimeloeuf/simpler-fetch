import { sf } from "../sf.js";
import { TimeoutException } from "simpler-fetch";

export default [
  {
    title: [
      "Simulates timeout failure with a 0.01 second custom timeout",
      "where this will timeout before the API responds in 0.5 seconds",
    ],
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/delay")
        .timeoutAfter(10)
        .runJSON();

      console.log(res, err);
      console.log(
        `Error is 'TimeoutException'`,
        err instanceof TimeoutException
      );
    },
  },
  {
    title: [
      "Simulates no error with a 1 second custom timeout",
      "where this will not timeout since the API responds in 0.5 seconds",
    ],
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/delay")
        .timeoutAfter(1000)
        .runJSON();

      console.log(res, err);
    },
  },
];
