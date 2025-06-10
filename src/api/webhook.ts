import express from "express";
import webhookRouter from "../routes/webhook.js";
import serverless from "serverless-http";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/webhook", webhookRouter);

// All API routes must be exported as default handler
export default serverless(app);