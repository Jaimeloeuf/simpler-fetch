# errors/
Folder for all the custom named error classes.


## Why?
Custom named error classes are used so that library users can check for the various failure modes with the `instanceof` operator against these exported error classes.


## How is this different from exceptions?
Errors are unrecoverable issues and are thrown by the program. Once an error has happened, there is nothing the program can do to recover from it. While exceptions are expected invalid states of the program that are recoverable, and they are treated as values and returned to the library user instead of being thrown. See [Errors vs Exceptions](../../docs/Errors%20vs%20Exceptions.md) for more details.