import express, { type Response, Request, NextFunction, ErrorRequestHandler } from "express";
import webhookRouter from "../src/routes/webhook.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log("Middleware start!");
app.use("/", webhookRouter);
app.use("/", (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.error("/api/webhook error: ", err);
  res.status(500).send("Internal server error");
})

export default app;