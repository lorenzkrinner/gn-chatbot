// api/webhook.ts
import express, { type Response, type Request, type NextFunction } from "express";
import webhookRouter from "../src/routes/webhook.js";
import serverless from "serverless-http";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log("Middleware start!");
app.use("/", webhookRouter);

app.use("/", (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("/api/webhook error: ", err);
  res.status(500).send("Internal server error");
});

export default serverless(app); 