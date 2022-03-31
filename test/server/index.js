const express = require("express");
const app = express();

app.use(require("cors")({ origin: "*" }));

app.get("/test", (req, res) => res.status(200).send({ test: "working" }));

app.post("/test", express.json(), (req, res) =>
  res.status(200).send({
    auth: req.headers.authorization,
    headers: req.headers,
    received: req.body,
  })
);

const port = process.env.PORT || 3000; // Defaults to PORT 3000
app.listen(port, () => console.log(`Server running on port: ${port}`));
