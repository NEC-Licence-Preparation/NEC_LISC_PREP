## NEC License Exam Prep

Full-stack exam prep platform built with Next.js (App Router), MongoDB (Mongoose), NextAuth (credentials + Google), Tailwind, and Chart.js.

### Features

- User auth (register/login), role-based access (admin, user), protected routes via middleware.
- Admin: upload questions via JSON, create/delete questions, assign category/subject/difficulty.
- Users: take MCQ tests, per-question timer, score calculation, history, and progress chart.
- Data models: User, Question, TestAttempt.

### Tech Stack

- Next.js 16 (App Router) + React 19 + Tailwind
- NextAuth (JWT sessions, credentials + optional Google OAuth)
- MongoDB + Mongoose
- Chart.js via react-chartjs-2
- Zod for validation, bcryptjs for hashing

### Getting Started

1. Install deps

```bash
npm install
```

2. Configure env
   Copy `.env.example` to `.env.local` and fill values:

- MONGODB_URI
- MONGODB_DB (defaults `nec_exam` if omitted)
- NEXTAUTH_SECRET
- NEXTAUTH_URL (e.g., http://localhost:3000)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional)

3. Run dev server

```bash
npm run dev
```

Visit http://localhost:3000.

### API Notes

- POST /api/register — create user
- GET/POST /api/questions — list/create (admin)
- POST /api/questions/import — bulk import JSON (admin)
- GET/PUT/DELETE /api/questions/:id — manage question (admin)
- POST /api/tests/submit — submit answers, score stored
- GET /api/tests/history — user attempts

### JSON Import Example

```json
{
  "category": "Civil Engineering",
  "subject": "Engineering Mathematics",
  "questions": [
    {
      "question": "What is the derivative of x^2?",
      "options": ["x", "2x", "x^2", "2"],
      "correctAnswer": "2x",
      "difficulty": "easy"
    }
  ]
}
```

### Seeding an Admin

Register a user, then set its `role` to `admin` in MongoDB manually (or via a quick script/compass update).

### Production

- Set env vars in hosting platform (Vercel friendly).
- Ensure NEXTAUTH_URL matches deployed URL and NEXTAUTH_SECRET is strong.

### Testing

- Lint: `npm run lint`
- Manual flow: register, login, upload JSON as admin, take test, view dashboard.
