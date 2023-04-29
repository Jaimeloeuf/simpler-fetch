# Why is `fetch` not exposed?
This technical document explains why the underlying `fetch` api is not exposed on any of the Classes.

1. Library users should be using the library's API. If they want to use the underlying `fetch` function, they should just use it directly instead of going through a layer of indirection by accessing it from the library.
1. This library does not allow users to set a custom `fetch` function, because this already relies on the globally scoped `fetch` function. So if users want to set it, they can monkey patch it in. The other reason is also because this library mainly supports modern platforms like modern browsers and node v18 and above, all of these already have support for `fetch` so there is no need to ask user to polyfill it.