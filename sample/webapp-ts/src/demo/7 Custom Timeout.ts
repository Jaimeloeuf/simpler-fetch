import { sf, TimeoutException } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function customTimeout() {
  await printGroup(
    [
      "Simulates timeout failure with a 0.01 second custom timeout",
      "where this will timeout before the API responds in 0.5 seconds",
    ],

    async () => {
      const { res, err } = await sf
        .useDefault()
        .GET("/delay")
        .timeoutAfter(10)
        .runJSON();

      console.log(res, err);
      console.log(
        `Error is 'TimeoutException'`,
        err instanceof TimeoutException
      );
    }
  );

  await printGroup(
    [
      "Simulates no error with a 1 second custom timeout",
      "where this will not timeout since the API responds in 0.5 seconds",
    ],

    async () => {
      const { res, err } = await sf
        .useDefault()
        .GET("/delay")
        .timeoutAfter(1000)
        .runJSON();

      console.log(res, err);
    }
  );
}
