"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const FACULTIES = [
  "Civil Engineering",
  "Computer Engineering",
  "Electrical Engineering",
];

export default function UserProfile() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [selectedFaculty, setSelectedFaculty] = useState(
    session?.user?.faculty || ""
  );
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [isUsernameLoading, setIsUsernameLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch current username
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await fetch("/api/profile/faculty");
        const data = await res.json();
        if (res.ok && data.user?.username) {
          setCurrentUsername(data.user.username);
          setUsername(data.user.username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      } finally {
        setIsUsernameLoading(false);
      }
    };

    if (session?.user) {
      fetchUsername();
    }
  }, [session]);

  if (!session?.user) {
    return <p className="text-[#424874]/70">Loading profile...</p>;
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

  const handleUsernameSave = async () => {
    setUsernameError("");
    setUsernameSuccess("");

    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUsernameError(data?.error || "Failed to update username");
        return;
      }

      setCurrentUsername(data.username);
      setUsernameSuccess("Username updated successfully!");
      setTimeout(() => setUsernameSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setUsernameError("Network error. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete account. Please try again.");
        setIsDeleting(false);
        return;
      }

      // Sign out and redirect
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google OAuth Info Card */}
      <div className="border border-[#DCD6F7] rounded p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4 text-[#424874]">
          Account Information
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#A6B1E1] uppercase tracking-wide">
              Name
            </label>
            <p className="text-[#424874] mt-1">{session.user.name || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[#A6B1E1] uppercase tracking-wide">
              Email
            </label>
            <p className="text-[#424874] mt-1">{session.user.email || "N/A"}</p>
          </div>
          {session.user.image && (
            <div>
              <label className="text-xs font-medium text-[#A6B1E1] uppercase tracking-wide">
                Profile Picture
              </label>
              <div className="mt-3">
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="h-16 w-16 rounded-full border-2 border-[#DCD6F7]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Username Card */}
      <div className="border border-[#DCD6F7] rounded p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4 text-[#424874]">Username</h2>
        <p className="text-sm text-[#424874]/70 mb-4">
          Set a unique username to be discoverable by friends.
        </p>

        {isUsernameLoading ? (
          <p className="text-[#424874]/70">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-[#DCD6F7] rounded focus:outline-none focus:ring-2 focus:ring-[#A6B1E1]"
              />
              <p className="text-xs text-[#424874]/60 mt-1">
                Only letters, numbers, and underscores allowed
              </p>
            </div>

            {usernameError && (
              <p className="text-sm text-red-600" role="alert">
                {usernameError}
              </p>
            )}
            {usernameSuccess && (
              <p className="text-sm text-green-600" role="alert">
                {usernameSuccess}
              </p>
            )}

            <button
              onClick={handleUsernameSave}
              disabled={username === currentUsername || username.trim().length < 3}
              className="px-4 py-2 rounded bg-[#424874] text-white hover:bg-[#424874]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {currentUsername ? "Update Username" : "Set Username"}
            </button>
          </div>
        )}
      </div>

      {/* Faculty Selection Card */}
      <div className="border border-[#DCD6F7] rounded p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4 text-[#424874]">
          Faculty Choice
        </h2>
        <p className="text-sm text-[#424874]/70 mb-4">
          Select your faculty to personalize your exam preparation.
        </p>

        <div className="space-y-3">
          {FACULTIES.map((faculty) => (
            <label
              key={faculty}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name="faculty"
                value={faculty}
                checked={selectedFaculty === faculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                disabled={isSaving}
                className="w-4 h-4 accent-[#424874] cursor-pointer"
              />
              <span className="text-[#424874]">{faculty}</span>
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
            isSaving || selectedFaculty === (session?.user?.faculty || "")
          }
          className="mt-4 px-4 py-2 rounded bg-[#424874] text-white hover:bg-[#424874]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSaving ? "Saving..." : "Save Faculty"}
        </button>
      </div>

      {/* Delete Account Card */}
      <div className="border border-red-300 rounded p-6 bg-red-50 shadow">
        <h2 className="text-lg font-semibold mb-4 text-red-700">
          Danger Zone
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Deleting your account will permanently remove all your data including
          test history, bookmarks, streaks, and friend connections. This action
          cannot be undone.
        </p>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-red-700">
              Are you absolutely sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}
