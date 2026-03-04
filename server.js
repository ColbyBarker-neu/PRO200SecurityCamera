const path = require("path");
const express = require("express");
const db = import("./database.js"); //Link to enable access to the redis database, accessRedis should handle CRUD operations

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
