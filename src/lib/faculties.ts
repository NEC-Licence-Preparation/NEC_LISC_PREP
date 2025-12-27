export const faculties = [
  "Civil Engineering",
  "Computer Engineering",
  "Electrical Engineering",
] as const;

export type Faculty = (typeof faculties)[number];
