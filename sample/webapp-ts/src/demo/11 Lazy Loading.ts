import { printGroup } from "../utils.js";

export async function lazyLoading() {
  await printGroup(
    [
      "Import the API library lazily into your application.",
      "Only do this if your entire application only needs this library for a",
      "small number of API calls only such as a landing page's contact form.",
      "For all other purposes, it is easier to do a top level import first.",
    ],

    async () => {
      const { sf } = await import("simpler-fetch");
      const [err, res] = await sf
        .useOnce("https://jsonplaceholder.typicode.com/todos/1")
        .GET()
        .runJSON();

      console.log(res, err);
    }
  );
}
