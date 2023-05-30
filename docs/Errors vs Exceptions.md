# Errors vs Exceptions
30/05/2023

This library handles errors and exceptions differently, before that is explored, this document explores the differences between errors and exceptions for context.


## Errors
Errors are invalid states of your program that should not occur or situations that the developer does not expect to happen. If such a situation occurred, it is not something that can be fixed / dealt with by the program itself, usually the developer needs to fix these issues.

For example, OOM (out of memory) error is a classic situation that can happen which the developer does not expect, and the program will not be able to deal with this issue and resolve it.


## Exceptions
Exceptions are various possible undesirable states of your program that can occur. If such a situation occurred, it is expected for the program itself to deal with it or give users the choice on how to move forward. Otherwise known as recoverable errors.

In a sense you can think of exceptions as error states that a program can recover from, and since it can be recovered from, it should be made as easy as possible to do so, therefore it should be treated as a return value rather than an Error that is thrown.

For example, user input validation error is a classic situation that can happen in a program that takes user inputs, which the developer expects. The program should be able to deal with this situation, and this is usually dealt with by asking users to fix their inputs before trying again.


## Handling of Errors vs Exceptions in this library
Unlike most JavaScript apps and libraries that just treat both Errors and Exceptions as Errors to throw, this library handles Errors and Exceptions differently by only throwing Errors just like how it was intended to be used, but **returns** Exceptions as a value, so that library users can deal with the exception easily in a sequential manner without having to deal with JavaScript's try/catch jumpy control flow.