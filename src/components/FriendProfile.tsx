"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";

interface FriendData {
  friend: {
    id: string;
    username: string;
    name: string;
    email?: string;
    faculty: string;
    image?: string;
    currentStreak?: number;
    longestStreak?: number;
  };
  stats?: {
    testsCompleted: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    subjectStats: Record<string, { total: number; correct: number; incorrect: number }>;
  };
  limited?: boolean;
}

export default function FriendProfile({ friendId }: { friendId: string }) {
  const router = useRouter();
  const [data, setData] = useState<FriendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const res = await fetch(`/api/friends/${friendId}`);
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || "Failed to load profile");
          setIsLoading(false);
          return;
        }

        setData(result);
      } catch (err) {
        console.error("Error fetching friend data:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-primary/70">Loading profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
        <button
          onClick={() => router.push("/friends")}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
        >
          Back to Friends
        </button>
      </div>
    );
  }

  const { friend, stats } = data;
  const isLimited = data.limited;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/friends")}
        className="text-primary hover:text-primary/80 flex items-center gap-2 transition"
      >
        <span>←</span> Back to Friends
      </button>

      <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
        <div className="flex items-start gap-6">
          <Avatar
            src={friend.image}
            alt={friend.name}
            size={96}
            className="border-2 border-[#DCD6F7]"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary mb-1">@{friend.username}</h1>
            <p className="text-lg text-primary/80 mb-2">{friend.name}</p>
            <p className="text-sm text-primary/60 mb-4">{friend.faculty}</p>

            {!isLimited && (
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-primary/60">Current Streak</p>
                  <p className="text-2xl font-bold text-primary">
                    🔥 {friend.currentStreak ?? 0} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary/60">Best Streak</p>
                  <p className="text-2xl font-bold text-primary">
                    ⭐ {friend.longestStreak ?? 0} days
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isLimited && stats ? (
        <>
          <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary">Overall Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 bg-[#F4EEFF] rounded">
                <p className="text-sm text-primary/60 mb-1">Tests Completed</p>
                <p className="text-2xl font-bold text-primary">{stats.testsCompleted}</p>
              </div>
              <div className="p-4 bg-[#F4EEFF] rounded">
                <p className="text-sm text-primary/60 mb-1">Questions Solved</p>
                <p className="text-2xl font-bold text-primary">{stats.totalQuestions}</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-green-700/70 mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-700">{stats.correctAnswers}</p>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <p className="text-sm text-red-700/70 mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-red-700">{stats.incorrectAnswers}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-primary/70 mb-2">
                <span>Accuracy</span>
                <span className="font-semibold">{stats.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary">Subject-wise Performance</h2>
            {Object.keys(stats.subjectStats).length === 0 ? (
              <p className="text-primary/60 text-center py-4">No test data available</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.subjectStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([subject, subjectData]) => {
                    const percentage =
                      subjectData.total > 0
                        ? Math.round((subjectData.correct / subjectData.total) * 100)
                        : 0;
                    const barColor =
                      percentage >= 75
                        ? "bg-green-500"
                        : percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500";

                    return (
                      <div key={subject} className="border-b border-[#DCD6F7] pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-primary">{subject}</h3>
                          <span className="text-sm text-primary/70">
                            {subjectData.correct}/{subjectData.total} correct
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-primary/70 mb-2">
                          <span>Total: {subjectData.total}</span>
                          <span className="text-green-600">Correct: {subjectData.correct}</span>
                          <span className="text-red-600">Incorrect: {subjectData.incorrect}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${barColor} h-2 rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-primary w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow text-center">
          <h2 className="text-lg font-semibold text-primary mb-2">Limited profile</h2>
          <p className="text-primary/70">
            Add this user as a friend to view their streaks and performance stats.
          </p>
        </div>
      )}
    </div>
  );
}
