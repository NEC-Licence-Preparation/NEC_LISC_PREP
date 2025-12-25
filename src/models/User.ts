import { Schema, models, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string | null; // null for OAuth-only users
  role: "admin" | "user";
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const User = models.User || model<IUser>("User", UserSchema);
export default User;
