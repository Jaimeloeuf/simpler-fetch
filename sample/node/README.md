# node
- Sample project using library in `node.js`
    - This requires node v18+ support where fetch is natively available
    - You can use `node-fetch` as fetch polyfill by monkey patching it in.
- This script is a es6 module, as this library is designed specifically for modern environments only


## Running the script
1. Make sure the [API server](../server/) is already up and running
1. Install dependencies
    ```shell
    npm install
    ```
1. Run the script
    ```shell
    npm run serve
    ```