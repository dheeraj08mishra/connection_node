import mongoose from "mongoose";
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["interested", "rejected", "pending", "accepted", "cancelled"],
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
);
const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
connectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
export default ConnectionRequest;
