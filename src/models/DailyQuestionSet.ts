import { Schema, models, model, Types } from "mongoose";

export interface IDailyQuestionSet {
  date: string; // YYYY-MM-DD format
  faculty: string;
  set10: Types.ObjectId[]; // 10 questions
  set100: Types.ObjectId[]; // 100 questions
  createdAt?: Date;
}

const DailyQuestionSetSchema = new Schema<IDailyQuestionSet>(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    faculty: { type: String, required: true, index: true },
    set10: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    set100: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index for uniqueness
DailyQuestionSetSchema.index({ date: 1, faculty: 1 }, { unique: true });

const DailyQuestionSet =
  models.DailyQuestionSet ||
  model<IDailyQuestionSet>("DailyQuestionSet", DailyQuestionSetSchema);
export default DailyQuestionSet;
