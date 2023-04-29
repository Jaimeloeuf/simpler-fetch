# return this
Why does most of the methods in the different classes have a `return this;` or `return CLASS_NAME;` on their last line?

This is to use the builder pattern by returning the current instance or class, so that users can chain method calls to build their request configs before finally calling one of the run methods to actually make the request.