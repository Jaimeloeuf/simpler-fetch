const port = process.env.PORT || 3000; // Defaults to PORT 3000

const express = require("express");
const router = express.Router({ mergeParams: true });

// Simple echo route
router.all(
  "/test",
  express.json(),
  express.urlencoded({ extended: true }),
  (req, res) => {
    // Allow client to access all the non standard headers the API service returns
    res.header("Access-Control-Expose-Headers", "*");

    res.status(200).json({
      url: req.url,
      method: req.method,
      headers: req.headers,
      version: req.params.version,
      body: req.body,
    });
  }
);

// Route to showcase Response validation
// This returns the correct / expected response data back to client.
router.get("/response-validation/correct", express.json(), (_, res) => {
  res.status(200).json({ someCustomData: true });
});

// Route to showcase Response validation
// This returns the incorrect / unexpected response data back to client.
router.get("/response-validation/incorrect", express.json(), (_, res) => {
  res.status(200).json({ someCustomData: 1 });
});

// API to simulate long running processing before responding back to users in 0.5 seconds
router.all("/delay", express.json(), (_, res) =>
  setTimeout(() => res.status(200).json({ processCompleted: true }), 500)
);

// Route to return 'text' data type
router.get("/datatype/text", (_, res) => {
  res.status(200).send("sample text response");
});

// Route to return 'blob' data type
router.all("/datatype/blob", (_, res) => {
  res.status(200).send(Buffer.from("sample blob response"));
});

// Route to return 'formdata' data type
router.get("/datatype/formdata", (_, res) => {
  const fd = new FormData();
  fd.append("some-value", "test");
  res.status(200).send(fd);
});

// Route to return 'arraybuffer' data type
router.all("/datatype/arraybuffer", (_, res) => {
  const ab = new ArrayBuffer(0);
  res.status(200).send(Buffer.from(ab));
});

express()
  // Allow all origins since the sample Web App is ran on a different port
  .use(require("cors")({ origin: "*" }))

  // Mount the router with a version param prefix for the different base Urls.
  .use("/:version", router)

  // Start server
  .listen(port, () => console.log(`Server running on port: ${port}`));
