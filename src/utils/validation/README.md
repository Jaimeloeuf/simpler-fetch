# utils/validation/
Folder for all validation related utility modules.

## What?
Currently this folder is only used for utility modules to help convert validator/parser functions from validation/parsing libraries into the [Validator type predicate type](../../types/Validator.ts) so that it can be used for runtime response validation.

An example of this is the [zodToValidator](./zodToValidator.ts) adapter, which adapts a zod schema object into a validation function that the library can use for type safe runtime response validation.