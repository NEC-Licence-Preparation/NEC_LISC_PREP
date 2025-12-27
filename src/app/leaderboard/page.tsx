"use client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useSession } from "next-auth/react";
import NavBar from "@/components/layout/NavBar";

interface LeaderboardEntry {
  userId: string;
  username?: string;
  name: string;
  faculty?: string;
  image?: string | null;
  testsCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<20 | 50 | 100>(50);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailKind, setDetailKind] = useState<"admin" | "friend" | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboard?limit=${limit}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load leaderboard");
          return;
        }
        setEntries(data.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch error", err);
        setError("Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return (
    <>
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-6 px-4 pt-6 pb-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
            <p className="text-primary/70">Ranking by accuracy (correct / total)</p>
              {session?.role === "admin" && (
                <p className="mt-1 text-xs text-primary/60">Admin: click any row to view full user details</p>
              )}
          </div>
          <div className="flex items-center gap-2 text-sm text-primary/80">
            <label htmlFor="limit" className="font-medium">Top</label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) as 20 | 50 | 100)}
              className="px-3 py-2 border border-[#DCD6F7] rounded bg-white text-primary focus:outline-none focus:ring-2 focus:ring-[#A6B1E1]"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-primary/70 text-center py-12">Loading leaderboard...</p>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-primary/60">Please try again later.</p>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-primary/60 text-center py-12">No leaderboard data yet.</p>
        ) : (
          <div className="bg-white border border-[#DCD6F7] rounded shadow divide-y divide-[#DCD6F7]">
            {entries.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-4 py-3 transition ${
                  session?.role === "admin" ? "hover:bg-[#F4EEFF] cursor-pointer" : ""
                }`}
                onClick={async () => {
                  setSelected(entry);
                  setDetail(null);
                  setDetailKind(null);
                  setDetailError(null);
                  setDetailLoading(true);
                  try {
                    // Try admin details first
                    const res = await fetch(`/api/admin/users/${entry.userId}`, { credentials: "include" });
                    if (res.ok) {
                      const data = await res.json();
                      setDetailKind("admin");
                      setDetail(data);
                    } else if (res.status === 401 || res.status === 403) {
                      // Fallback to restricted friend profile
                      const fr = await fetch(`/api/friends/${entry.userId}`, { credentials: "include" });
                      const frData = await fr.json();
                      if (!fr.ok) {
                        setDetailError(frData?.error || "Failed to load profile");
                      } else {
                        setDetailKind("friend");
                        setDetail(frData);
                      }
                    } else {
                      const data = await res.json().catch(() => ({}));
                      setDetailError(data?.error || "Failed to load user details");
                    }
                  } catch (e) {
                    setDetailError("Failed to load user details");
                  } finally {
                    setDetailLoading(false);
                  }
                }}
              >
                <div className="w-10 text-center text-lg font-semibold text-primary">#{idx + 1}</div>
                <Avatar src={entry.image || undefined} alt={entry.name} size={48} />
                <div className="flex-1">
                  <p className="font-semibold text-primary underline-offset-2 hover:underline cursor-pointer">
                    {entry.username ? `@${entry.username}` : entry.name}
                  </p>
                  <p className="text-sm text-primary/70">{entry.name}</p>
                  {entry.faculty && (
                    <p className="text-xs text-primary/60">{entry.faculty}</p>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-primary/80">
                  <div className="text-right">
                    <p className="font-semibold text-primary text-lg">{entry.accuracy}%</p>
                    <p className="text-xs text-primary/60">Accuracy</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.correctAnswers}/{entry.totalQuestions}</p>
                    <p className="text-xs text-primary/60">Correct/Total</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.testsCompleted}</p>
                    <p className="text-xs text-primary/60">Tests</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User detail modal (admin full or restricted for others) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => { setSelected(null); setDetail(null); setDetailError(null); }}>
          <div className="w-full max-w-lg bg-white rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#DCD6F7] px-4 py-3">
              <h3 className="text-lg font-semibold text-primary">User Details</h3>
              <button className="text-primary/70 hover:text-primary" onClick={() => { setSelected(null); setDetail(null); setDetailError(null); }}>✕</button>
            </div>
            <div className="p-4 space-y-3">
              {detailLoading && <p className="text-primary/70">Loading...</p>}
              {detailError && <p className="text-red-600">{detailError}</p>}
              {!detailLoading && !detailError && detail && detailKind === "admin" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={detail.user.image || undefined} alt={detail.user.name} size={56} />
                    <div>
                      <p className="font-semibold text-primary">{detail.user.name}</p>
                      {detail.user.username && (
                        <p className="text-sm text-primary/70">@{detail.user.username}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-primary/60">Email</p>
                      <p className="font-medium text-primary">{detail.user.email}</p>
                    </div>
                    <div>
                      <p className="text-primary/60">Faculty</p>
                      <p className="font-medium text-primary">{detail.user.faculty || "-"}</p>
                    </div>
                    <div>
                      <p className="text-primary/60">Role</p>
                      <p className="font-medium text-primary">{detail.user.role}</p>
                    </div>
                    <div>
                      <p className="text-primary/60">Created</p>
                      <p className="font-medium text-primary">{detail.user.createdAt ? new Date(detail.user.createdAt).toLocaleString() : "-"}</p>
                    </div>
                    <div>
                      <p className="text-primary/60">Last Activity</p>
                      <p className="font-medium text-primary">{detail.user.lastActivityDate ? new Date(detail.user.lastActivityDate).toLocaleString() : "-"}</p>
                    </div>
                  </div>
                  <div className="border-t border-[#DCD6F7] pt-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-primary/60 text-xs">Accuracy</p>
                      <p className="text-lg font-semibold text-primary">{detail.stats.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-primary/60 text-xs">Correct/Total</p>
                      <p className="text-lg font-semibold text-primary">{detail.stats.correctAnswers}/{detail.stats.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-primary/60 text-xs">Tests</p>
                      <p className="text-lg font-semibold text-primary">{detail.stats.testsCompleted}</p>
                    </div>
                  </div>
                </div>
              )}
              {!detailLoading && !detailError && detail && detailKind === "friend" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={detail.friend.image || undefined} alt={detail.friend.name} size={56} />
                    <div>
                      <p className="font-semibold text-primary">{detail.friend.name}</p>
                      {detail.friend.username && (
                        <p className="text-sm text-primary/70">@{detail.friend.username}</p>
                      )}
                      {detail.friend.faculty && (
                        <p className="text-xs text-primary/60">{detail.friend.faculty}</p>
                      )}
                    </div>
                  </div>
                  {detail.limited ? (
                    <p className="text-primary/70 text-sm">This is a restricted profile. Become friends to see more details.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-primary/60">Email</p>
                          <p className="font-medium text-primary">{detail.friend.email}</p>
                        </div>
                        <div>
                          <p className="text-primary/60">Current Streak</p>
                          <p className="font-medium text-primary">{detail.friend.currentStreak || 0}</p>
                        </div>
                        <div>
                          <p className="text-primary/60">Longest Streak</p>
                          <p className="font-medium text-primary">{detail.friend.longestStreak || 0}</p>
                        </div>
                      </div>
                      <div className="border-t border-[#DCD6F7] pt-3 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-primary/60 text-xs">Accuracy</p>
                          <p className="text-lg font-semibold text-primary">{detail.stats.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-primary/60 text-xs">Correct/Total</p>
                          <p className="text-lg font-semibold text-primary">{detail.stats.correctAnswers}/{detail.stats.totalQuestions}</p>
                        </div>
                        <div>
                          <p className="text-primary/60 text-xs">Tests</p>
                          <p className="text-lg font-semibold text-primary">{detail.stats.testsCompleted}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="border-t border-[#DCD6F7] px-4 py-3 flex justify-end">
              <button className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90" onClick={() => { setSelected(null); setDetail(null); setDetailError(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
