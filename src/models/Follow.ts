import { Schema, model, models } from "mongoose";

export interface IFollow {
  followerId: string;
  followeeId: string;
  createdAt?: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: String, required: true, index: true },
    followeeId: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

// Delete cached model to ensure schema updates
delete (models as any).Follow;

const Follow = model<IFollow>("Follow", FollowSchema);
export default Follow;
