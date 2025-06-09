import express, { Request, Response, type Router } from "express";
const router = express.Router();

export const webhookVerifier: Router = router.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  // Verification if necessary
});

export const webhookHandler: Router = router.post("/", async(req: Request, res: Response) => {
  console.log(req.body);
})