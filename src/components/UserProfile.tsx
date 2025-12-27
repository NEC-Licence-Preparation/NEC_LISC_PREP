"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

const FACULTIES = [
  "Civil Engineering",
  "Computer Engineering",
  "Electrical Engineering",
];

export default function UserProfile() {
  const { data: session, update: updateSession } = useSession();
  const [selectedFaculty, setSelectedFaculty] = useState(
    session?.user?.faculty || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  if (!session?.user) {
    return <p className="text-slate-600">Loading profile...</p>;
  }

  const handleFacultySave = async () => {
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/profile/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty: selectedFaculty }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data?.error || "Failed to save faculty");
        setIsSaving(false);
        return;
      }

      // Update session to reflect new faculty
      await updateSession({ faculty: selectedFaculty });
      setSaveSuccess("Faculty updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setSaveError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google OAuth Info Card */}
      <div className="border rounded p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Name
            </label>
            <p className="text-slate-900 mt-1">{session.user.name || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Email
            </label>
            <p className="text-slate-900 mt-1">{session.user.email || "N/A"}</p>
          </div>
          {session.user.image && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Profile Picture
              </label>
              <div className="mt-3">
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="h-16 w-16 rounded-full border border-slate-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Selection Card */}
      <div className="border rounded p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">Faculty Choice</h2>
        <p className="text-sm text-slate-600 mb-4">
          Select your faculty to personalize your exam preparation.
        </p>

        <div className="space-y-3">
          {FACULTIES.map((faculty) => (
            <label key={faculty} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="faculty"
                value={faculty}
                checked={selectedFaculty === faculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                disabled={isSaving}
                className="w-4 h-4 text-slate-900 cursor-pointer"
              />
              <span className="text-slate-900">{faculty}</span>
            </label>
          ))}
        </div>

        {saveError && (
          <p className="text-sm text-red-600 mt-4" role="alert">
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p className="text-sm text-green-600 mt-4" role="alert">
            {saveSuccess}
          </p>
        )}

        <button
          onClick={handleFacultySave}
          disabled={
            isSaving ||
            selectedFaculty === (session?.user?.faculty || "")
          }
          className="mt-4 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSaving ? "Saving..." : "Save Faculty"}
        </button>
      </div>
    </div>
  );
}
