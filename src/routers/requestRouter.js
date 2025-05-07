import express from "express";
const requestRouter = express.Router();
import { userAuth } from "../middleware/auth.js";

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const { firstName, lastName } = req.user;
    res.send(`Connection request sent by ${firstName} ${lastName}`);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

export default requestRouter;
