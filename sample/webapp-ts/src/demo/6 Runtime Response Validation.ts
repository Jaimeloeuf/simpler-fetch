import { sf, ValidationException, zodToValidator } from "simpler-fetch";

// Used for the response validation example
import { ZodError, z } from "zod";

import { printGroup } from "../utils.js";

export async function responseValidation() {
  type ExpectedResponseType = { someCustomData: boolean };

  await printGroup(
    "Demos a response that is validated with a custom type predicate",

    async () => {
      const validator = (data: unknown): data is { someCustomData: boolean } =>
        typeof (data as any)?.someCustomData === "boolean";

      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/response-validation/correct")
        .runJSON<ExpectedResponseType>(validator);

      console.log(res, err);
    }
  );

  await printGroup(
    "Demos a response that is invalid, checked with a custom type predicate",

    async () => {
      const validator = (data: unknown): data is { someCustomData: boolean } =>
        (data as any)?.someCustomData === true ||
        (data as any)?.someCustomData === false;

      const [err, _res] = await sf
        .useDefaultBaseUrl()
        .GET("/response-validation/incorrect")
        .runJSON<ExpectedResponseType>(validator);

      console.error(err);
      console.log(
        `Error is 'ValidationException'`,
        err instanceof ValidationException
      );
    }
  );

  await printGroup(
    [
      "Demos a response that is validated with zod",
      "Since the custom type predicate is not super type safe,",
      "e.g. if you return true without any checks TS will assume data: unknown to be correctly typed.",
      "Thus this example show cases using an external validation library like `Zod`",
      "that provide stronger runtime type checking/validation garuntees.",
      "To use a Zod Parser easily in a type safe manner, the `zodToValidator` utility function",
      "is used to convert the Zod Parser to a validator type expected by this API library.",
    ],

    async () => {
      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/response-validation/correct")

        // The generic here is optional since it can infer the response type from
        // the validator function. THis will error out if you give it a wrong type
        // anyways, so this is just here for extra safety but is optional. You can
        // choose to rely on your validator function as the source of truth for your data type
        .runJSON<ExpectedResponseType>(
          zodToValidator(z.object({ someCustomData: z.boolean() }))
        );

      console.log(res, err);
    }
  );

  await printGroup(
    [
      "Demos a response that is invalid, checked with zod",
      "This purposely gets wrong data from API service, to showcase how `ZodError`",
      "is bubbled up through the API library when Response validation fails.",
    ],

    async () => {
      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/response-validation/incorrect")

        // The generic here is optional since it can infer the response type from
        // the validator function. THis will error out if you give it a wrong type
        // anyways, so this is just here for extra safety but is optional. You can
        // choose to rely on your validator function as the source of truth for your data type
        .runJSON<ExpectedResponseType>(
          zodToValidator(z.object({ someCustomData: z.boolean() }))
        );

      console.log("res validation with zod incorrect", res, err);

      if (err !== null) {
        // See RequestError
        // although ZodError not a child type of the RequestError union type,
        // you can still use instanceof to check if it is a ZodError or any other
        // custom error class in a type safe manner.
        console.log(err instanceof ZodError);
        console.error(err);
      }
    }
  );
}
