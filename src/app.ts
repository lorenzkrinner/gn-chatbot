import express from "express";
import { webhookHandler, webhookVerifier } from "./routes/webhook.js";

const app = express();
const port = 3000;

app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/webhook", webhookHandler);
app.use("/webhook", webhookVerifier);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});