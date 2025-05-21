import express from "express";
const requestRouter = express.Router();
import { userAuth } from "../middleware/auth.js";
import ConnectionRequest from "../models/connectRequest.js";
import User from "../models/user.js";

requestRouter.post(
  "/sendConnectionRequest/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const senderId = req.user._id;
      const receiverId = req.params.userId;
      const status = req.params.status;

      const isValidReceiverId = await User.findById(receiverId);
      if (!isValidReceiverId) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!["interested", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (senderId.equals(receiverId)) {
        return res
          .status(400)
          .json({ message: "You cannot send a request to yourself" });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });
      if (existingRequest) {
        return res.status(400).json({ message: "Request already sent" });
      }

      const newRequest = new ConnectionRequest({
        senderId,
        receiverId,
        status,
      });
      await newRequest.save();

      if (status === "interested") {
        res.status(201).json({
          message: `your connection request was sent successfully`,
          request: newRequest,
        });
      }
      if (status === "rejected") {
        res.status(201).json({
          message: `you ignored the connection request`,
          request: newRequest,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong", details: error.message });
    }
  }
);

requestRouter.post(
  "/reviewConnectionRequest/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const userId = req.user._id;

      const allowedStatuses = ["accepted", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const request = await ConnectionRequest.findOne({
        _id: requestId,
        status: "interested",
        receiverId: userId,
      }).populate("senderId", "firstName lastName photo about");
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.receiverId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to review this request" });
      }

      request.status = status;
      await request.save();

      res.status(200).json({
        message: `Connection request ${status} successfully`,
        request,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong", details: error.message });
    }
  }
);

export default requestRouter;
