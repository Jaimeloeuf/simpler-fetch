# `oof`'s error handling
Error handling in libraries like `axios v0.27.2` and `superagent v8.0.0` means writing boilerplate code yourself to catch any errors that bubbles up / get thrown. This makes their method calls 'unsafe' in the sense that you either spend alot of time writing boilerplate code over and over again yourself or let the error bubble up somewhere else in the control flow which could make things much harder to debug and break your applications in unexpected ways.

In version 7 and earlier, `oof` was doing the exact same thing as these libraries, but after using this library for sometime, I realise that it is extremely frustrating to either constantly write hard to reason about control flows for error handling or live with the risk of unexpected error handling by just ignoring it.

That is when I decided to redesign the library to handler errors nicely. Looking around, I realise I really enjoyed writing code in Rust and Go, in part because of the way error is handled sequentially and treated just like any other values, rather than a special control flow affecting type value.

This is why, after experimenting with a few ways of doing things, I landed on a way to handle errors very similar to how Go lang does it with the help of TypeScript, where errors are just values returned from the method calls, and they are handled **sequentially** right after the method call. Users do not need to worry about the code's control flow jumping about everywhere for example to the nearest `catch` method or the nearest `catch` block!

This makes error handling much more pleasant and makes the overall code much easier to reason about thanks to its more sequential nature.