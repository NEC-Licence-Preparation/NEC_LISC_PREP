import { Schema, models, model } from "mongoose";

export interface IBookmark {
  userEmail: string;
  questionId: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userEmail: { type: String, required: true },
    questionId: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure a user can't bookmark the same question twice
BookmarkSchema.index({ userEmail: 1, questionId: 1 }, { unique: true });

// Recompile model in dev to avoid stale schemas after hot reload
if (models.Bookmark) {
  delete models.Bookmark;
}

const Bookmark = model<IBookmark>("Bookmark", BookmarkSchema);
export default Bookmark;
