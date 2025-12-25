import { Schema, models, model } from "mongoose";

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  faculty: string;
  explanation: string;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    subject: { type: String, required: true },
    faculty: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { timestamps: true }
);

// Recompile model in dev to avoid stale schemas after hot reload
if (models.Question) {
  delete models.Question;
}

const Question = model<IQuestion>("Question", QuestionSchema);
export default Question;
