import express from "express";
const userRouter = express.Router();
import { userAuth } from "../middleware/auth.js";
import ConnectionRequest from "../models/connectRequest.js";
import User from "../models/user.js";

const USER_SAFE_DATA =
  "firstName lastName photo age gender about skills hobbies";

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const connections = await ConnectionRequest.find({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    }).populate("senderId receiverId", USER_SAFE_DATA);

    if (!connections || connections.length === 0) {
      return res.json({ message: "No connections found", user: [] });
    }

    const userConnectionList = connections.map((connection) => {
      if (connection.senderId._id.equals(userId)) {
        return {
          ...connection.receiverId._doc,
          status: connection.status,
        };
      }
      return {
        ...connection.senderId._doc,
        status: connection.status,
      };
    });

    res.status(200).json({
      message: `Connections retrieved total count is ${userConnectionList.length}`,
      userConnectionList,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

userRouter.get("/user/requestListReceived", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequest.find({
      receiverId: loggedInUser._id,
      status: "interested",
    })
      .populate("senderId", USER_SAFE_DATA)
      .sort({ createdAt: -1 });

    let userData = requests.map((request) => {
      if (request.receiverId._id.equals(req.user._id)) {
        return {
          ...request.senderId._doc,
          status: request.status,
          requestId: request._id,
          receiverId: request.receiverId,
        };
      }
    });

    res.status(200).json({ message: "Request fetched", user: userData });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch received requests",
      error: error.message,
    });
  }
});

userRouter.get("/user/requestListSent", userAuth, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ senderId: req.user._id })
      .populate("receiverId", USER_SAFE_DATA)
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sent requests", error: error.message });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 50;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        message: "Page and limit must be greater than 0",
      });
    }
    limit = Math.min(limit, 100); // Limit the maximum number of users to 100
    const skip = (page - 1) * limit;

    const connections = await ConnectionRequest.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    }).populate("senderId receiverId", USER_SAFE_DATA);

    const hideUser = new Set();
    connections.forEach((user) => {
      hideUser.add(user.senderId._id.toString());
      hideUser.add(user.receiverId._id.toString());
    });
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { _id: { $nin: Array.from(hideUser) } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: `Feed retrieved successfully total count is ${users.length}`,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch feed",
      error: error.message,
    });
  }
});

export default userRouter;
