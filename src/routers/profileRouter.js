import express from "express";
const profileRouter = express.Router();
import { userAuth } from "../middleware/auth.js";
import User from "../models/user.js";
import { validateEditProfile } from "../utils/validatonFile.js";

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
profileRouter.patch("/updateProfile", userAuth, async (req, res) => {
  try {
    const isValid = validateEditProfile(req.body);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid fields to update" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.age) {
      req.body.age = Number(req.body.age);
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    await user.save();

    res.json({
      message: `${user.firstName}, your profile was updated successfully`,
      user: user,
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
