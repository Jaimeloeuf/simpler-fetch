import { oof } from "../../dist/index.js";

// async IIFE to use async await without using top level await as older browsers dont support it
(async function () {
  // Change this to use dist/oof so the .then dont have to destructure it out
  // import("../../dist/index.js")
  //     .then(({ oof }) => oof.GET("https://jsonplaceholder.typicode.com/todos/1").runJSON())
  //     .then(res => console.log("res", res));

  oof._baseUrl = "http://localhost:3000";
  console.log("oof._baseUrl: ", oof._baseUrl);

  /* ================================= GET ================================= */

  // API call to registered API server
  await oof
    .GET("/test")
    .runJSON()
    .then((res) => console.log("res 0", res));

  // API call to registered API server with header set in multiple ways
  await oof
    .GET("/test")
    // Fixed header object
    .header({ headerOne: 1 })
    // Synchronous function that returns a header object
    .header(() => ({ headerTwo: 1 }))
    // Asynchronous function that returns a promise that resolves to a header object
    .header(async () => ({ headerThree: 3 }))
    .runJSON()
    .then((res) => console.log("res 1", res));

  // API call to local API server with full path
  await oof
    .GET("http://localhost:3000/test")
    .runJSON()
    .then((res) => console.log("res 2", res));

  // API call to external API server with full path
  await oof
    .GET("https://jsonplaceholder.typicode.com/todos/1")
    .runJSON()
    .then((res) => console.log("res 3", res));

  /* ================================= POST ================================= */

  // POST request to registered API server
  await oof
    .POST("/test")
    .data({ some: "data" })
    .runJSON()
    .then((res) => console.log("res 4", res));

  // POST request to local API server with full path
  await oof
    .POST("http://localhost:3000/test")
    .data({ some: "data" })
    .runJSON()
    .then((res) => console.log("res 5", res));

  /* ================================= Error Handling ================================= */

  // API call to a definitely not available site to similiar API call failed
  await oof
    .GET("https://hopefully-this-not-registered.com/some/invalid/path")
    .runJSON()
    .then((res) => console.log("res 0", res))
    // Catch error and handle here to prevent the error from bubbling up
    .catch((err) => console.error("API call failed\n", err));
})();
