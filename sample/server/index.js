const express = require("express");
const app = express();

app.use(require("cors")({ origin: "*" }));

// Simple echo server
app.all("*", express.json(), (req, res) =>
  res.status(200).json({
    ok: true,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
  })
);

const port = process.env.PORT || 3000; // Defaults to PORT 3000
app.listen(port, () => console.log(`Server running on port: ${port}`));
