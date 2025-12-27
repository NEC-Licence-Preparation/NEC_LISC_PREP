import { Schema, models, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string | null; // null for OAuth-only users
  role: "admin" | "user";
  faculty?: string | null;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null },
    faculty: {
      type: String,
      enum: [
        "Civil Engineering",
        "Computer Engineering",
        "Electrical Engineering",
      ],
      default: null,
      required: false,
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: true }, strict: false }
);

// Delete cached model to ensure schema updates
delete (models as any).User;

const User = model<IUser>("User", UserSchema);
export default User;
