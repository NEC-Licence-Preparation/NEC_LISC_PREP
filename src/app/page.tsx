import Link from "next/link";
import NavBar from "@/components/layout/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid gap-8 lg:gap-10">
        <section className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-[#A6B1E1]">
              NEC License Prep
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#424874]">
              Practice, track, and master exam readiness.
            </h1>
            <p className="text-[#424874]/70 text-base sm:text-lg">
              Timed MCQs, detailed history, and admin-driven question uploads
              keep your prep aligned and current.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="border-2 border-[#424874] text-[#424874] px-5 py-3 rounded hover:bg-[#424874] hover:text-white transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="border border-[#DCD6F7] rounded-lg bg-white shadow p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A6B1E1]">Sample Question</p>
                <p className="font-semibold text-[#424874]">
                  What is the derivative of x^2?
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-[#424874] text-white rounded">
                With explanation
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              {["x", "2x", "x^2", "2"].map((o) => (
                <li
                  key={o}
                  className="border border-[#DCD6F7] rounded px-3 py-2 flex justify-between text-[#424874]"
                >
                  <span>{o}</span>
                  {o === "2x" && (
                    <span className="text-green-600">Correct</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#A6B1E1]">
              Upload JSON to add subjects, attach explanations, and deploy new
              question sets instantly.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
