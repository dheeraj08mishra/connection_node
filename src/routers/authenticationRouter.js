import express from "express";
import validator from "validator";
import User from "../models/user.js";
const authenticationRouter = express.Router();
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

    const newUser = new User({
      firstName,
      lastName,
      email,
      age,
      phoneNumber,
      gender,
      skills,
      hobbies,
      photo,
    });
    newUser.password = await newUser.hashPassword(password);

    await newUser.save();

    const token = await newUser.getJWT();
    console.log(process.env.COOKIES_AGE);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_AGE),
    });

    res.status(201).json({
      message: `Welcome ${firstName}, your account was created successfully`,
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        age: newUser.age,
        phoneNumber: newUser.phoneNumber,
      },
    });
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
    console.log(process.env.COOKIES_AGE);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_AGE),
    });
    res.json({
      message: `Welcome back ${user.firstName}, you are logged in successfully`,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

authenticationRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, sameSite: "Strict" });

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

authenticationRouter.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_AGE),
    });
    // Here you would send the token to the user's email

    res.status(200).json({ message: "Password reset token sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

export default authenticationRouter;
