import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const QuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  subject: z.string(),
  faculty: z.string(),
  explanation: z.string().optional().default(""),
});

export const ImportSchema = z.object({
  subject: z.string(),
  faculty: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).min(2),
      correctAnswer: z.string(),
      explanation: z.string().optional().default(""),
    })
  ),
});

export const FlatImportSchema = z.array(
  z.object({
    question: z.string(),
    options: z.array(z.string()).min(2),
    correctAnswer: z.string(),
    explanation: z.string().optional().default(""),
    subject: z.string(),
    faculty: z.string(),
  })
);

export const QuizImportSchema = z.object({
  title: z.string(),
  desc: z.string(),
  questions: z.array(
    z.object({
      q: z.string(),
      options: z.array(z.string()).min(2),
      answer: z.string(),
      explanation: z.string().optional().default(""),
    })
  ),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type QuestionInput = z.infer<typeof QuestionSchema>;
export type ImportInput = z.infer<typeof ImportSchema>;
export type FlatImportInput = z.infer<typeof FlatImportSchema>;
export type QuizImportInput = z.infer<typeof QuizImportSchema>;
