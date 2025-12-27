import { Schema, models, model } from "mongoose";

export interface IFriendRequest {
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate requests
FriendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Recompile model in dev to avoid stale schemas after hot reload
if (models.FriendRequest) {
  delete models.FriendRequest;
}

const FriendRequest = model<IFriendRequest>("FriendRequest", FriendRequestSchema);
export default FriendRequest;
