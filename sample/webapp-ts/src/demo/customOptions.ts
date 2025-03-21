import { sf } from "../sf.js";
import { printGroup } from "../utils.js";

export async function customOptions() {
  await printGroup(
    "Demo to show how to set Options object for the API call",

    async () => {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/test")
        .useOptions({ credentials: "omit" })
        .runJSON();

      console.log(res, err);
    }
  );
}
