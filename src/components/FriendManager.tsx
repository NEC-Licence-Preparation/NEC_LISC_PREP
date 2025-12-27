"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  faculty: string;
  image?: string;
}

interface FriendRequest {
  _id: string;
  senderId: string;
  receiverId: string;
  status: string;
  sender?: User;
  receiver?: User;
  createdAt: string;
}

export default function FriendManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"search" | "requests" | "friends">(
    "search"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [toast, setToast] = useState<
    | {
        message: string;
        type: "success" | "error";
      }
    | null
  >(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    } else if (activeTab === "friends") {
      fetchFriends();
    } else if (activeTab === "search") {
      fetchFollowing();
    }
  }, [activeTab]);

  const fetchFollowing = async () => {
    try {
      const res = await fetch("/api/follow");
      const data = await res.json();
      if (res.ok) {
        setFollowingIds(data.ids || []);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/request");
      const data = await res.json();
      if (res.ok) {
        setReceivedRequests(data.received || []);
        setSentRequests(data.sent || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/list");
      const data = await res.json();
      if (res.ok) {
        setFriends(data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/friends/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
        fetchFollowing();
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      if (res.ok) {
        showToast("Friend request sent!", "success");
        setSearchResults(searchResults.filter((user) => user._id !== receiverId));
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to send request", "error");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      showToast("Failed to send request", "error");
    }
  };

  const handleFollowToggle = async (followeeId: string, isFollowing: boolean) => {
    try {
      const res = await fetch("/api/follow", {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followeeId }),
      });

      if (res.ok) {
        setFollowingIds((prev) => {
          if (isFollowing) return prev.filter((id) => id !== followeeId);
          return [...new Set([...prev, followeeId])];
        });
        showToast(isFollowing ? "Unfollowed" : "Following", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Action failed", "error");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      showToast("Action failed", "error");
    }
  };

  const handleRespondToRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (res.ok) {
        showToast(
          action === "accept"
            ? "Friend request accepted!"
            : "Friend request rejected",
          "success"
        );
        fetchRequests();
        if (action === "accept" && activeTab === "friends") {
          fetchFriends();
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to respond to request", "error");
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      showToast("Failed to respond to request", "error");
    }
  };

  const handleViewProfile = (friendId: string) => {
    router.push(`/friends/${friendId}`);
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Friend removed", "success");
        fetchFriends();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to remove friend", "error");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      showToast("Failed to remove friend", "error");
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`rounded border px-4 py-3 text-sm shadow transition ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#DCD6F7]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === "search"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-primary/60 hover:text-primary"
            }`}
          >
            Search Users
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === "requests"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-primary/60 hover:text-primary"
            }`}
          >
            Friend Requests
            {receivedRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === "friends"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-primary/60 hover:text-primary"
            }`}
          >
            My Friends ({friends.length})
          </button>
        </div>
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-primary">
            Search Users
          </h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by username..."
              className="flex-1 px-3 py-2 border border-[#DCD6F7] rounded focus:outline-none focus:ring-2 focus:ring-[#A6B1E1]"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="px-6 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="space-y-3">
            {searchResults.length === 0 && !isSearching && (
              <p className="text-primary/60 text-center py-8">
                Search for users to add as friends
              </p>
            )}
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 border border-[#DCD6F7] rounded hover:bg-[#F4EEFF] transition"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.image}
                    alt={user.name}
                    size={40}
                  />
                  <div>
                    <p className="font-semibold text-primary">
                      @{user.username}
                    </p>
                    <p className="text-sm text-primary/70">{user.name}</p>
                    <p className="text-xs text-primary/60">{user.faculty}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendRequest(user._id)}
                    className="px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90 transition"
                  >
                    Add Friend
                  </button>
                  <button
                    onClick={() =>
                      handleFollowToggle(
                        user._id,
                        followingIds.includes(user._id)
                      )
                    }
                    className="px-4 py-2 rounded border border-primary text-primary text-sm hover:bg-primary/10 transition"
                  >
                    {followingIds.includes(user._id) ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    onClick={() => handleViewProfile(user._id)}
                    className="px-4 py-2 rounded border border-[#DCD6F7] text-primary text-sm hover:bg-[#F4EEFF] transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-primary/70 text-center py-8">Loading...</p>
          ) : (
            <>
              {/* Received Requests */}
              <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
                <h2 className="text-lg font-semibold mb-4 text-primary">
                  Received Requests
                </h2>
                {receivedRequests.length === 0 ? (
                  <p className="text-primary/60 text-center py-4">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-3">
                    {receivedRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 border border-[#DCD6F7] rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={request.sender?.image}
                            alt={request.sender?.name || "Sender"}
                            size={40}
                          />
                          <div>
                            <p className="font-semibold text-primary">
                              @{request.sender?.username}
                            </p>
                            <p className="text-sm text-primary/70">
                              {request.sender?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleRespondToRequest(request._id, "accept")
                            }
                            className="px-4 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleRespondToRequest(request._id, "reject")
                            }
                            className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
                <h2 className="text-lg font-semibold mb-4 text-primary">
                  Sent Requests
                </h2>
                {sentRequests.length === 0 ? (
                  <p className="text-primary/60 text-center py-4">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 border border-[#DCD6F7] rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={request.receiver?.image}
                            alt={request.receiver?.name || "Receiver"}
                            size={40}
                          />
                          <div>
                            <p className="font-semibold text-primary">
                              @{request.receiver?.username}
                            </p>
                            <p className="text-sm text-primary/70">
                              {request.receiver?.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-primary/60">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <div className="bg-white border border-[#DCD6F7] rounded p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-primary">
            My Friends
          </h2>
          {isLoading ? (
            <p className="text-primary/70 text-center py-8">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="text-primary/60 text-center py-8">
              No friends yet. Search for users to add them!
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-4 border border-[#DCD6F7] rounded hover:bg-[#F4EEFF] transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={friend.image}
                      alt={friend.name}
                      size={40}
                    />
                    <div>
                      <p className="font-semibold text-primary">
                        @{friend.username}
                      </p>
                      <p className="text-sm text-primary/70">{friend.name}</p>
                      <p className="text-xs text-primary/60">
                        {friend.faculty}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(friend._id)}
                      className="px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90 transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend._id)}
                      className="px-4 py-2 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
