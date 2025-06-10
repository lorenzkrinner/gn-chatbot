import express from "express";
import webhookRouter from "./routes/webhook.js";
import serverless from "serverless-http";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/webhook", webhookRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

export default serverless(app);