import express, { type Response, Request, NextFunction, ErrorRequestHandler } from "express";
import webhookRouter from "../src/routes/webhook.js";
import serverless from "serverless-http";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", webhookRouter);

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.error("/api/webhook error: ", err);
  res.status(500).send("Internal server error");
})

export default serverless(app);