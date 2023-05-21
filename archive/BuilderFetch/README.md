# BuilderFetch
This is an archive of an experiment used to split up the runtime response validator setting methods into a standalone method, and to experiment with modifying a generic class' generic type using a instance method.

This was abandoned since this relied on alot of type hackery and does not enforce any sequencing for the builder method chainings. So even though the validator can be set using a standalone `validatesWith` method and chained, it does not actually improve DX since it can be used out of order and cause more issues.