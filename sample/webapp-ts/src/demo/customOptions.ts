import { sf } from "../sf.js";

export default [
  {
    title: "Demo to show how to set Options object for the API call",
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/test")
        .useOptions({ credentials: "omit" })
        .runJSON();

      console.log(res, err);
    },
  },
];
