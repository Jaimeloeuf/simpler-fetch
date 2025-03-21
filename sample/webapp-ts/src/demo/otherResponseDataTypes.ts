import { sf } from "../sf.js";

export default [
  {
    title: "runText",
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/datatype/text")
        .runText();

      console.log(res, err);
    },
  },
  {
    title: "runBlob",
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/datatype/blob")
        .runBlob();

      console.log(res, err);
    },
  },
  {
    title: "runFormData",
    async fn() {
      // const [err, res] = await sf
      //   .useBaseUrl("v1")
      //   .GET("/datatype/formdata")
      //   .runFormData();

      // console.log(res, err);

      console.log("No examples currently since this doesnt have much use.");
    },
  },
  {
    title: "runArrayBuffer",
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/datatype/arraybuffer")
        .runArrayBuffer();

      console.log(res, err);
    },
  },
];
