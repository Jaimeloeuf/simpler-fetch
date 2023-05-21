import type { ApiResponse, Validator } from "./types";
import { safe } from "./safe";

/**
 * Class used to create an Object Oriented `Fetch` abstraction
 *
 * This object oriented approach gives users a easy to use chainable interface to build their API calls
 */
export class Fetch<ResponseType> {
  /* Private Instance variables that are only accessible internally */

  /**
   * Request object holding all the information needed to make a fetch request
   */
  readonly #request: Request;

  /**
   */
  readonly #responseParser: (res: Response) => Promise<ResponseType>;

  /**
   */
  readonly #abortController?: AbortController;

  /**
   */
  readonly #timeoutInMilliseconds?: number;

  /**
   * Low level constructor API that should not be used directly by library users.
   * This is only used by the `Builder` class to construct a new instance after
   * using the builder pattern.
   *
   * ### Important
   * When passing in the default options and headers, make sure to pass in a new
   * object and array, as these will be passed in by reference, which means that
   * the original options object and header array will be mutated when `Fetch`
   * instance methods mutate the values on the instance itself.
   */
  constructor(
    request: Request,
    responseParser: (res: Response) => Promise<ResponseType>,
    abortController: AbortController | undefined,
    timeoutInMilliseconds: number | undefined
  ) {
    this.#request = request;
    this.#responseParser = responseParser;
    this.#abortController = abortController;
    this.#timeoutInMilliseconds = timeoutInMilliseconds;
  }

  /**
   * ### About
   * This is private `#fetch` method is used to make the API call internally after constructing the
   * API call object and configuring all its values using object oriented method chaining with the
   * instance methods. This method should only be called by the `#run` wrapper method which implements
   * the timeout logic.
   *
   * This method is basically a wrapper around the fetch API where it takes all the options configured
   * using the public instance methods and stored in the instance variables and use these for fetch
   * API's RequestInit parameter, while taking care of certain things like creating the full API url
   * using any baseUrl set with `setBaseUrl`, delayed header generation and etc...
   *
   * ### Method 'safety'
   * This is the underlying raw fetch method that might throw an error when something goes wrong.
   *
   * ### More on the return type
   * The return type is unioned with `never` because this function can throw, aka never return.
   * However with TS, any value unioned with `never`, will be itself, because checking for control
   * flow is not enforced / not possible with TS. This is more for documentation purposes for
   * library writers and users who want to learn more about this API.
   */
  #fetch(): Promise<Response> | never {
    // This library does not check if `fetch` is available in the global scope,
    // it assumes it exists, if it does not exists, please load a `fetch` polyfill first!
    return fetch(this.#request);
  }

  /**
   * ### About
   * This private method wraps the raw `#fetch` method to implement custom timeout logic.
   *
   * This is the underlying raw `#run` method used by all other 'safe' run methods, `run`, `runJSON`,
   * `runText`, `runBlob`, `runFormData`, `runArrayBuffer`.
   *
   * ### Method 'safety'
   * All other 'run' methods are safe by default, i.e. they do not throw on any errors/exceptions!
   * This is the only underlying raw method that might throw an error/exception when something goes
   * wrong. All the other methods are wrapped in the `safe` function to catch any errors so that it
   * can be returned instead of causing a jump in the code control flow to the nearest catch block.
   *
   * The safety feature is super useful as it reduces the amount of boiler plate code you have to
   * write (try/catch blocks and .catch methods) when dealing with libraries that can throw as it
   * will disrupt your own code's flow. This safe APIs enables you to write single block level code
   * that are guaranteed to not throw and gives you a super readable code control flow!
   *
   * ### More on the return type
   * This method's Function type signature mirrors the Function type signature of the `#fetch`
   * method since this method is just a wrapper over it to implement timeout, whatever that is
   * returned from `#fetch` is directly returned to this method's caller.
   *
   * See the documentation for `#fetch` method for more information on its return type.
   */
  async #run(): Promise<Response> | never {
    // If there is no custom timeout specified, just directly run and return the result of `#fetch`
    if (this.#abortController === undefined) return this.#fetch();

    // Create a new timeout using the custom timeout milliseconds value, and save the timeoutID so
    // that the timer can be cleared to skip the callback if the API returns before the timeout.
    const timeoutID = setTimeout(
      // On timeout, abort the API call with a custom reason with the caller specified timeout value.
      //
      // As TS notes, the `this.#abortController` variable could be changed and became  undefined/null
      // between the time that this setTimeout callback function is defined and when this is triggered.
      // Since there is no other code that will modify this variable, its value can be safely assumed
      // to not be deleted when this callback is called, which means that a non-null assertion operator
      // can be used. However just to be extra safe, an optional chaining operator is used instead, so
      // in the event where it is somehow undefined/null, this will not error out.
      //
      // If `this.#fetch` method call throws an Error that is not caused by this timeout, for e.g. an
      // error like DNS failed, the `clearTimeout` call will be skipped since the custom catch block
      // re-throws any error it gets. That means that this abort method will still be called even if
      // the API call has already errored out. However this is fine since calling abort after the API
      // call completes will just be ignored and will not cause any new errors to be thrown.
      () =>
        this.#abortController?.abort(
          `${this.#timeoutInMilliseconds}ms time out exceeded`
        ),

      this.#timeoutInMilliseconds
    );

    const res = await this.#fetch().catch((err: unknown) => {
      // If the error is caused by the abort signal, throw a new custom error,
      // Else, re-throw original error to let method caller handle it.
      if (
        err instanceof DOMException &&
        err.name === "AbortError" &&
        // This can be thought of as an almost redundant check, since the first 2 conditions
        // should already ensure that it is an `AbortError`. This checks just makes sure that
        // the AbortError is in fact caused by the internal `#abortController` used for custom
        // timeouts rather than a abort controller passed in via options.
        //
        // This also ensures that `.signal.reason` access is properly typed after narrowing the
        // optional abortController's type in this control flow conditional.
        this.#abortController?.signal.aborted
      )
        // Throw new error with abort reason as message instead of the generic 'DOMException'
        // If reason is somehow empty, default to err.message to prevent throwing an empty error.
        throw new Error(this.#abortController.signal.reason ?? err.message);

      // Throw err to continue if not an abort error as we dont have to override the message
      throw err;
    });

    // What if the fetch call errors out and this clearTimeout is not called?
    //
    // If `this.#fetch` method call throws an Error that is not caused by the abort signal, e.g. an
    // error like DNS failed, this `clearTimeout` call will be skipped since the custom catch block
    // re-throws any error it gets. That means that the timeout callback will still call the abort
    // method even if the API call has already errored out. However that is fine since calling abort
    // after the API call completes will just be ignored and will not cause any new errors.
    clearTimeout(timeoutID);

    // Let response from `#fetch` pass through once timeout wrapper logic completed.
    return res;
  }

  #optionalResponseValidator?: Validator<ResponseType>;

  validateWith(responseValidator: Validator<ResponseType>) {
    this.#optionalResponseValidator = responseValidator;
    return this;

    // This forces the user to only be able to chain `call` method as the next method.
    // @todo
    // Cant this be just used in the original Fetch class?
    // E.g. run methods can only return an object with 2 methods, either validateWith or the call method
    return { call: this.call.bind(this) };
  }

  /**
   * Alternative method to set the validator and run the call method immediately
   * instead of chaining yet another method call, since there is no other methods
   * that can be called after `validateWith` anyways.
   */
  callAndValidateWith<ExpectedResponseType extends ResponseType = ResponseType>(
    responseValidator: Validator<ResponseType>
  ) {
    this.#optionalResponseValidator = responseValidator;
    // By doing this, it will be a single method instead of returning this again...
    return this.call<ExpectedResponseType>();
  }

  call<ExpectedResponseType extends ResponseType = ResponseType>() {
    return safe(async () => {
      const res = await this.#run();

      // @todo Update this docs
      // Assume data to be T without any validation, so that if no validator passed in,
      // it can be assumed that the data is correctly shaped as `T` during compile time.
      //
      // If not annotated with the type T, inference works for the most part, but sometimes
      // the type can end up as `Awaited<T>`. This only affects the `runJSON` method where
      // data is inferred as `Awaited<T>` instead of `T`, which is technically the same type,
      // but confuses lib users, where it is probably caused by .json value extraction that
      // returns `any` so the conversion here does not properly take place.
      // Reference: https://github.com/microsoft/TypeScript/issues/47144
      const data = (await this.#responseParser(res)) as ExpectedResponseType;

      // Only run validation if a validator is passed in
      // User's validator can throw an error, which will be safely bubbled up to them,
      // if they want to receive a custom error instead of the generic `Error("Validation Failed")`
      if (
        this.#optionalResponseValidator !== undefined &&
        !this.#optionalResponseValidator(data)
      )
        throw new Error("Validation Failed");

      return {
        ok: res.ok,
        status: res.status,
        headers: res.headers,
        data,
      } satisfies ApiResponse<ExpectedResponseType>;
    });
  }
}
