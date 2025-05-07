import express from "express";
const profileRouter = express.Router();
import { userAuth } from "../middleware/auth.js";
import User from "../models/user.js";

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    res.status(200).json({
      message: "User profile retrieved",
      user: req.user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

profileRouter.get("/feedAll", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ message: "Users retrieved", users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

export default profileRouter;
