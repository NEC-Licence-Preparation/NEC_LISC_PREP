import { Schema, models, model, Types } from "mongoose";

export interface IAnswer {
  questionId: Types.ObjectId;
  selectedOption: string;
  correct: boolean;
}

export interface ITestAttempt {
  userId: Types.ObjectId;
  answers: IAnswer[];
  score: number;
  timeTaken: number; // seconds
  date: Date;
  subject?: string;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  selectedOption: { type: String, required: true },
  correct: { type: Boolean, required: true },
});

const TestAttemptSchema = new Schema<ITestAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: [AnswerSchema], required: true },
  score: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  date: { type: Date, default: () => new Date() },
  subject: { type: String },
});

const TestAttempt =
  models.TestAttempt || model<ITestAttempt>("TestAttempt", TestAttemptSchema);
export default TestAttempt;
