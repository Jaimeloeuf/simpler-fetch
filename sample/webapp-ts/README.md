# webapp-ts
Sample project with a webapp written in TS and corresponding API server to demonstrate the use of this library.

The webapp demonstrates how to use the `oof` class with TS specific features. You can still use this library without TS, by simply ignoring all the TS annotations.

This requires the browser to support the modern fetch API.


## Running the webapp
1. Make sure the [API server](../server/) is already up and running
1. Go to the main project folder root, and build the project
    ```shell
    # Install dependencies required for simpler-fetch to build
    npm install
    # Build simpler-fetch locally so the sample app can use the latest development version
    npm run build
    ```
1. Install dependencies
    ```shell
    npm install
    ```
1. Run the webapp
    ```shell
    npm run serve
    ```
1. Navigate to http://localhost:8080