import NavBar from "@/components/layout/NavBar";
import WrongRetestRunner from "@/components/WrongRetestRunner";
import WrongCountBadge from "@/components/WrongCountBadge";

export default function RetestWrongPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Retest Wrong Questions</h1>
          <WrongCountBadge />
        </div>
        <p className="text-slate-600 text-sm">
          We'll load up to 10 questions you previously answered incorrectly. As you
          answer them correctly, they will be removed from your wrong-question pool.
        </p>
        <WrongRetestRunner />
      </main>
    </div>
  );
}
