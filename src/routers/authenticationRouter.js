import express from "express";
import validator from "validator";
import User from "../models/user.js";
import { userAuth } from "../middleware/auth.js";
const authenticationRouter = express.Router();
import { validateEditProfile } from "../utils/validatonFile.js";
authenticationRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      phoneNumber,
      gender,
      skills,
      hobbies,
      photo,
    } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Weak password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await existingUser.hashPassword(password);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      phoneNumber,
      gender,
      skills,
      hobbies,
      photo,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

// ✅ AUTHENTICATE USER
authenticationRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_AGE),
    });

    res.send("login successful");
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

authenticationRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

authenticationRouter.delete("/delete", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted", user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

authenticationRouter.patch("/updateProfile", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req, res)) {
      return res.status(400).json({ message: "Invalid fields to update" });
    }
    const user = await User.findById(req.user._id);
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });
    await user.save();
    res.status(201).json({ message: "User updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

export default authenticationRouter;
