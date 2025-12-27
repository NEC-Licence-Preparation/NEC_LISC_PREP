"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/layout/NavBar";

type BookmarkedQuestion = {
  _id: string;
  question: string;
  subject: string;
  faculty: string;
  bookmarkedAt: string;
};

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch("/api/bookmarks");
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      } else {
        setError("Failed to load bookmarks");
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (questionId: string) => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });

      if (res.ok) {
        setBookmarks(bookmarks.filter((b) => b._id !== questionId));
      }
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  const removeAllBookmarks = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });

      if (res.ok) {
        setBookmarks([]);
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error("Error removing all bookmarks:", err);
      alert("Failed to remove all bookmarks. Please try again.");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#424874] mb-2">
              Bookmarked Questions
            </h1>
            <p className="text-sm text-[#424874]/70">
              Review your saved questions anytime
            </p>
          </div>
          {!loading && bookmarks.length > 0 && (
            <button
              onClick={() => router.push(`/test?bookmarks=all`)}
              className="bg-[#424874] text-white px-6 py-2.5 rounded-lg hover:bg-[#424874]/90 transition font-medium flex items-center gap-2"
            >
              <span>📝</span>
              Test All ({bookmarks.length})
            </button>
          )}
          {!loading && bookmarks.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-red-50 text-red-600 border-2 border-red-200 px-6 py-2.5 rounded-lg hover:bg-red-100 hover:border-red-300 transition font-medium flex items-center gap-2"
            >
              <span>🗑️</span>
              Clear All
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#A6B1E1]">Loading bookmarks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && bookmarks.length === 0 && (
          <div className="text-center py-12 bg-white border-2 border-[#DCD6F7] rounded-xl">
            <p className="text-xl mb-2">📑</p>
            <p className="text-[#424874] font-medium mb-2">
              No bookmarks yet
            </p>
            <p className="text-sm text-[#A6B1E1] mb-4">
              Bookmark questions during practice to review them later
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#424874] text-white px-6 py-2 rounded-lg hover:bg-[#424874]/90 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {!loading && !error && bookmarks.length > 0 && (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark._id}
                className="bg-white border-2 border-[#DCD6F7] rounded-xl p-5 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-[#A6B1E1] uppercase">
                        {bookmark.subject} • {bookmark.faculty}
                      </span>
                    </div>
                    <p className="text-[#424874] font-medium mb-3">
                      {bookmark.question}
                    </p>
                    <p className="text-xs text-[#A6B1E1]">
                      Bookmarked on{" "}
                      {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push(`/test?bookmarks=${bookmark._id}`)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#A6B1E1] text-white rounded-lg hover:bg-[#A6B1E1]/90 transition-all font-medium text-sm whitespace-nowrap"
                      title="Test this question"
                    >
                      <span>📝</span>
                      <span>Test</span>
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-medium text-sm whitespace-nowrap"
                      title="Remove bookmark"
                    >
                      <span className="text-lg">🗑️</span>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-[#424874]">
                  Remove All Bookmarks?
                </h3>
              </div>
              <p className="text-[#424874]/70 mb-6">
                This will permanently delete all {bookmarks.length} bookmarked question{bookmarks.length !== 1 ? 's' : ''}. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={deletingAll}
                  className="flex-1 px-4 py-2 border-2 border-[#DCD6F7] text-[#424874] rounded-lg hover:bg-[#F4EEFF] transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={removeAllBookmarks}
                  disabled={deletingAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  {deletingAll ? "Removing..." : "Remove All"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
