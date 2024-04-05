import { sf, ValidationException } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function otherResponseDataTypes() {
  await printGroup(
    "runText",

    async () => {
      const [err, res] = await sf.useDefault().GET("/datatype/text").runText();

      console.log(res, err);
    }
  );

  await printGroup(
    "runBlob",

    async () => {
      const [err, res] = await sf.useDefault().GET("/datatype/blob").runBlob();

      console.log(res, err);
    }
  );

  await printGroup(
    "runFormData",

    async () => {
      // const [err, res] = await sf
      //   .useDefault()
      //   .GET("/datatype/formdata")
      //   .runFormData();

      // console.log(res, err);

      console.log("No examples currently since this doesnt have much use.");
    }
  );

  await printGroup(
    "runArrayBuffer",

    async () => {
      const [err, res] = await sf
        .useDefault()
        .GET("/datatype/arraybuffer")
        .runArrayBuffer();

      console.log(res, err);
    }
  );
}
