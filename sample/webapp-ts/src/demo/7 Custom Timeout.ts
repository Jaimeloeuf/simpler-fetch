import { sf, TimeoutException } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function customTimeout() {
  await printGroup(
    [
      "Simulates a timeout failure",
      "API call to simulate custom timeout of 0.01 seconds",
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
      "Simulates a timeout failure",
      "API call to simulate custom timeout of 1 seconds",
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
