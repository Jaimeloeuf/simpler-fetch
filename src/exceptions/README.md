# exceptions/
Folder for all the custom named exception classes.


## Why?
Custom named exception classes are used so that library users can check for the various failure modes with the `instanceof` operator against these exported exception classes.


## How is this different from errors?
Exceptions are expected invalid states treated as values that are returned to library users. A program can recover from an exception, while an error is something that cannot be recovered from and is thrown by the program. See [Errors vs Exceptions](../../docs/Errors%20vs%20Exceptions.md) for more details.