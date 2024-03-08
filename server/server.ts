import express from "express";

const app = express();
const port = 8080;

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
