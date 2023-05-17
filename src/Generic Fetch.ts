import type { Validator } from "./types/Validator";

// Experiment to try a generic fetch class where the generic
// is set later using a method following the builder pattern
// instead of setting the generic in the constructor.
export class Fetch<T> {
  optionalResponseValidator?: Validator<T>;

  constructor(responseValidator?: Validator<T>) {
    this.optionalResponseValidator = responseValidator;
  }

  set<ConcreteType extends T = T>(
    responseValidator: Validator<ConcreteType>
  ): Fetch<ConcreteType> {
    this.optionalResponseValidator = responseValidator;

    // Use this to force it into a different type
    return this as unknown as Fetch<ConcreteType>;
  }

  get() {
    return this.optionalResponseValidator;
  }
}

const validator = (data: unknown): data is { someCustomData: boolean } =>
  (data as any)?.someCustomData === true ||
  (data as any)?.someCustomData === false;

const a = new Fetch();

// This is correctly typed to be Validator<{ someCustomData: boolean }> | undefined
// If this is done without chaining, so calling .get method on `a`
// directly will yield a generic type of `unknown` on the Validator.
const b = a.set(validator).get();
console.log(a, b);
