const express = require("express");
const app = express();

app.use(require("cors")({ origin: "*" }));

app.all("*", express.json(), function (req, res) {
  const { url, method, headers, body } = req;
  res.status(200).json({ ok: true, url, method, headers, body });
});

const port = process.env.PORT || 3000; // Defaults to PORT 3000
app.listen(port, () => console.log(`Server running on port: ${port}`));
