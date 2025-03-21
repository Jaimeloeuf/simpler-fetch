import { sf } from "../sf.js";

export default [
  {
    title: "API call with a base Url",
    async fn() {
      const [err, res] = await sf.useBaseUrl("v1").GET("/test").runJSON();

      console.log(res, err);
    },
  },
  {
    title: "One off call to an external API whose base URL is not saved",
    async fn() {
      const [err, res] = await sf
        .useFullUrl("https://jsonplaceholder.typicode.com/todos/1")
        .GET()
        .runJSON();

      console.log(res, err);
    },
  },
];
