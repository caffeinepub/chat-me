import { useEffect, useRef, useState } from "react";
import type { View } from "../App";
import type { AdminStats, ConversationInfo, PublicUser } from "../backend.d";
import { getActor } from "../lib/actor";

interface AdminViewProps {
  token: string;
  onBack: () => void;
  onNav: (v: View) => void;
  darkMode?: boolean;
}

type AdminTab = "stats" | "aanya";

export default function AdminView({
  token,
  onBack,
  darkMode = false,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Aanya inbox state
  const [aanyaConvs, setAanyaConvs] = useState<ConversationInfo[]>([]);
  const [aanyaLoading, setAanyaLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<bigint | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [aanyaMsgs, setAanyaMsgs] = useState<
    Array<{ sender: string; text: string; time: string; isAanya: boolean }>
  >([]);
  const [aanyaReplyText, setAanyaReplyText] = useState("");
  const [aanyaSending, setAanyaSending] = useState(false);
  const [aanyaError, setAanyaError] = useState("");
  const [aanyaSuccess, setAanyaSuccess] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = await getActor();
        const result = await actor.adminGetStats(token);
        const data = result[0] ?? null;
        if (data) {
          setStats(data);
        } else {
          setError("Access denied or no data 💔");
        }
      } catch {
        setError("Failed to load stats 💔");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // Load Aanya conversations when Aanya tab is active
  useEffect(() => {
    if (activeTab !== "aanya") return;
    const loadAanya = async () => {
      setAanyaLoading(true);
      try {
        const actor = await getActor();
        const convs = await actor.getAanyaConversations(token);
        setAanyaConvs(convs);
      } catch {
        // fallback — might not be implemented yet
        setAanyaConvs([]);
      } finally {
        setAanyaLoading(false);
      }
    };
    loadAanya();
  }, [activeTab, token]);

  // Load messages when a user is selected
  useEffect(() => {
    if (!selectedUserId) return;
    const loadMsgs = async () => {
      try {
        const actor = await getActor();
        // Get the DM chatId between Aanya (999999) and this user
        const aanyaId = 999999n;
        const aId = selectedUserId < aanyaId ? selectedUserId : aanyaId;
        const bId = selectedUserId < aanyaId ? aanyaId : selectedUserId;
        const chatId = `dm_${aId}_${bId}`;
        const msgs = await actor.getMessages(chatId);
        setAanyaMsgs(
          msgs.map((m) => ({
            sender: m.senderName,
            text: m.text,
            time: new Date(Number(m.timestamp) / 1_000_000).toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" },
            ),
            isAanya: m.senderId === aanyaId,
          })),
        );
      } catch {
        // ignore
      }
    };
    loadMsgs();
    const interval = setInterval(loadMsgs, 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aanyaMsgs.length]);

  const handleAanyaReply = async () => {
    if (!aanyaReplyText.trim() || !selectedUserId) return;
    setAanyaSending(true);
    setAanyaError("");
    setAanyaSuccess("");
    try {
      const actor = await getActor();
      const result = await actor.aanyaReply(
        token,
        selectedUserId,
        aanyaReplyText.trim(),
      );
      if (result && result.length > 0) {
        setAanyaSuccess("✅ Message sent as Aanya!");
        setAanyaReplyText("");
        setTimeout(() => setAanyaSuccess(""), 2000);
      } else {
        setAanyaError("Failed to send. Check admin token.");
      }
    } catch {
      setAanyaError("Could not send message. Try again.");
    } finally {
      setAanyaSending(false);
    }
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "40px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{
          background: darkMode ? "#111" : "#FFFAF5",
          borderBottom: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="admin.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:opacity-70 transition-all"
          style={{
            background: darkMode ? "#222" : "#FFF0F4",
            color: "#FF8C9F",
          }}
        >
          ←
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#FF8C9F" }}>
          Admin Panel 👑
        </h1>
      </div>

      {/* Tab switcher */}
      <div
        className="flex px-4 pt-4 gap-2"
        style={{ borderBottom: `1.5px solid ${darkMode ? "#222" : "#FFD1DC"}` }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className="flex-1 py-2.5 text-sm font-bold rounded-t-2xl transition-all"
          style={{
            background:
              activeTab === "stats"
                ? "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)"
                : "transparent",
            color:
              activeTab === "stats" ? "#FF8C9F" : darkMode ? "#888" : "#BBA0A8",
            borderBottom: activeTab === "stats" ? "2px solid #FF8C9F" : "none",
          }}
          data-ocid="admin.tab"
        >
          📊 Stats & Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("aanya")}
          className="flex-1 py-2.5 text-sm font-bold rounded-t-2xl transition-all"
          style={{
            background:
              activeTab === "aanya"
                ? "linear-gradient(135deg, #FFD1DC 0%, #F0ABFC 100%)"
                : "transparent",
            color:
              activeTab === "aanya" ? "#FF8C9F" : darkMode ? "#888" : "#BBA0A8",
            borderBottom: activeTab === "aanya" ? "2px solid #FF8C9F" : "none",
          }}
          data-ocid="admin.tab"
        >
          🌸 Aanya's Inbox
        </button>
      </div>

      {/* STATS TAB */}
      {activeTab === "stats" && (
        <div className="flex flex-col px-5 py-6 gap-5 max-w-2xl mx-auto w-full">
          {loading && (
            <div
              className="flex flex-col items-center py-20"
              data-ocid="admin.loading_state"
            >
              <span className="text-4xl animate-spin">✿</span>
              <p
                className="mt-3 text-sm font-semibold"
                style={{ color: "#7A6E6E" }}
              >
                Loading stats...
              </p>
            </div>
          )}
          {error && (
            <div
              className="px-4 py-3 rounded-2xl text-sm font-semibold text-center"
              style={{ background: "#FFD1DC", color: "#C0304A" }}
              data-ocid="admin.error_state"
            >
              {error}
            </div>
          )}
          {stats && (
            <>
              <div
                className="rounded-3xl p-6 flex flex-col items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)",
                  boxShadow: "0 8px 30px rgba(255,140,159,0.2)",
                }}
                data-ocid="admin.card"
              >
                <span
                  className="text-5xl font-bold"
                  style={{ color: "#FF8C9F" }}
                >
                  {Number(stats.userCount)}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
                >
                  Registered Users 🌸
                </span>
              </div>
              <div
                className="rounded-3xl p-5 flex flex-col gap-3"
                style={{
                  background: "rgba(255,250,245,0.9)",
                  border: "1.5px solid #FFD1DC",
                  boxShadow: "0 4px 20px rgba(255,140,159,0.1)",
                }}
              >
                <h2
                  className="font-bold text-base mb-1"
                  style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
                >
                  All Users 👥
                </h2>
                {stats.users.length === 0 && (
                  <div
                    className="text-center py-8"
                    data-ocid="admin.empty_state"
                  >
                    <span className="text-3xl">🌸</span>
                    <p className="text-sm mt-2" style={{ color: "#7A6E6E" }}>
                      No users yet
                    </p>
                  </div>
                )}
                {stats.users.map((user: PublicUser, i: number) => (
                  <div
                    key={Number(user.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{
                      background: "#FFF5F8",
                      border: "1.5px solid #FFE6DB",
                    }}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)",
                      }}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        "🌸"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm"
                          style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
                        >
                          {user.name}
                        </span>
                        {user.isAdmin && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#FF8C9F", color: "#fff" }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: "#7A6E6E" }}
                      >
                        @{user.username}
                      </p>
                      <p className="text-[10px]" style={{ color: "#aaa" }}>
                        Joined {formatDate(user.joinedAt)}
                      </p>
                    </div>
                    <div
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: "#E8DFFF", color: "#7A5AF8" }}
                    >
                      #{Number(user.id)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* AANYA INBOX TAB */}
      {activeTab === "aanya" && (
        <div
          className="flex flex-1 overflow-hidden"
          style={{ height: "calc(100vh - 130px)" }}
        >
          {/* Left panel: user list */}
          <div
            className="w-48 flex-shrink-0 flex flex-col overflow-y-auto border-r"
            style={{
              borderColor: darkMode ? "#333" : "#FFD1DC",
              background: darkMode ? "#0d0d0d" : "#FFF5FB",
            }}
          >
            <div
              className="px-3 py-3 border-b"
              style={{ borderColor: darkMode ? "#333" : "#FFD1DC" }}
            >
              <p className="text-xs font-bold" style={{ color: "#FF8C9F" }}>
                🌸 Aanya's Inbox
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: darkMode ? "#888" : "#7A6E6E" }}
              >
                Reply as Aanya
              </p>
            </div>
            {aanyaLoading ? (
              <div
                className="flex items-center justify-center py-8"
                data-ocid="admin.loading_state"
              >
                <span className="text-2xl animate-spin">🌸</span>
              </div>
            ) : aanyaConvs.length === 0 ? (
              <div
                className="flex flex-col items-center py-8 px-2 gap-2"
                data-ocid="admin.empty_state"
              >
                <span className="text-2xl">💬</span>
                <p
                  className="text-[11px] text-center"
                  style={{ color: darkMode ? "#666" : "#BBA0A8" }}
                >
                  No conversations yet
                </p>
              </div>
            ) : (
              aanyaConvs.map((conv, i) => (
                <button
                  key={conv.chatId}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(conv.otherUserId);
                    setSelectedUserName(
                      conv.otherUserName || conv.otherUserUsername,
                    );
                  }}
                  className="w-full flex flex-col px-3 py-2.5 text-left hover:opacity-80 transition-all"
                  style={{
                    background:
                      selectedUserId === conv.otherUserId
                        ? darkMode
                          ? "#1a1020"
                          : "#FFE0F0"
                        : "transparent",
                    borderBottom: `1px solid ${darkMode ? "#1a1a1a" : "#FFF0F4"}`,
                    borderLeft:
                      selectedUserId === conv.otherUserId
                        ? "3px solid #FF8C9F"
                        : "3px solid transparent",
                  }}
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <p
                    className="font-bold text-xs truncate"
                    style={{
                      color: darkMode ? "#f5f5f5" : "#1E1E1E",
                    }}
                  >
                    {conv.otherUserName || conv.otherUserUsername}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: darkMode ? "#888" : "#7A6E6E" }}
                  >
                    {conv.lastMessage || "No messages"}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Right panel: conversation + reply */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedUserId ? (
              <div
                className="flex flex-col items-center justify-center flex-1 gap-3"
                data-ocid="admin.panel"
              >
                <span className="text-4xl">🌸</span>
                <p
                  className="text-sm font-semibold"
                  style={{ color: darkMode ? "#888" : "#BBA0A8" }}
                >
                  Select a conversation
                </p>
                <p
                  className="text-xs text-center px-8"
                  style={{ color: darkMode ? "#555" : "#CCA0B0" }}
                >
                  See what users are saying to Aanya and reply as her
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div
                  className="px-4 py-3 border-b flex items-center gap-2"
                  style={{
                    borderColor: darkMode ? "#333" : "#FFD1DC",
                    background: darkMode ? "#111" : "#FFF5FB",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFD1DC 0%, #F0ABFC 100%)",
                    }}
                  >
                    🌸
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
                    >
                      Aanya ↔ {selectedUserName}
                    </p>
                    <p className="text-[10px]" style={{ color: "#FF8C9F" }}>
                      Replying as Aanya
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
                  style={{
                    background: darkMode
                      ? "#0d0d0d"
                      : "linear-gradient(135deg, #FFF0F8 0%, #FFE0EE 50%, #F5E0FF 100%)",
                  }}
                  data-ocid="admin.list"
                >
                  {aanyaMsgs.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center flex-1 py-8 gap-2"
                      data-ocid="admin.empty_state"
                    >
                      <span className="text-2xl">💬</span>
                      <p
                        className="text-xs"
                        style={{ color: darkMode ? "#666" : "#BBA0A8" }}
                      >
                        No messages yet
                      </p>
                    </div>
                  ) : (
                    aanyaMsgs.map((msg) => (
                      <div
                        key={msg.time + msg.text.slice(0, 8)}
                        className={`flex gap-2 ${
                          msg.isAanya ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        {msg.isAanya && (
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0 self-end flex items-center justify-center text-xs"
                            style={{
                              background:
                                "linear-gradient(135deg, #FFD1DC 0%, #F0ABFC 100%)",
                            }}
                          >
                            🌸
                          </div>
                        )}
                        <div
                          className={`flex flex-col gap-0.5 max-w-[75%] ${
                            msg.isAanya ? "items-start" : "items-end"
                          }`}
                        >
                          <div
                            className="px-3 py-2 text-xs font-medium"
                            style={{
                              background: msg.isAanya
                                ? darkMode
                                  ? "#2e2e3a"
                                  : "#F0E6FF"
                                : "linear-gradient(135deg, #FFD1DC 0%, #FFB6C8 100%)",
                              color: darkMode ? "#f5f5f5" : "#1E1E1E",
                              borderRadius: msg.isAanya
                                ? "12px 12px 12px 3px"
                                : "12px 12px 3px 12px",
                            }}
                          >
                            {msg.text}
                          </div>
                          <span
                            className="text-[9px] px-1"
                            style={{ color: "#aaa" }}
                          >
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply input */}
                <div
                  className="px-4 py-3 border-t flex flex-col gap-2"
                  style={{
                    borderColor: darkMode ? "#333" : "#FFD1DC",
                    background: darkMode ? "#111" : "rgba(255,250,245,0.9)",
                  }}
                >
                  {aanyaError && (
                    <p
                      className="text-xs font-semibold px-1"
                      style={{ color: "#C0304A" }}
                      data-ocid="admin.error_state"
                    >
                      {aanyaError}
                    </p>
                  )}
                  {aanyaSuccess && (
                    <p
                      className="text-xs font-semibold px-1"
                      style={{ color: "#2E8B57" }}
                      data-ocid="admin.success_state"
                    >
                      {aanyaSuccess}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aanyaReplyText}
                      onChange={(e) => setAanyaReplyText(e.target.value)}
                      placeholder="Reply as Aanya..."
                      className="flex-1 px-3 py-2 rounded-full text-xs outline-none"
                      style={{
                        background: darkMode ? "#1a1a1a" : "#FFF5F8",
                        border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
                        color: darkMode ? "#f5f5f5" : "#1E1E1E",
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAanyaReply()}
                      data-ocid="admin.input"
                    />
                    <button
                      type="button"
                      onClick={handleAanyaReply}
                      disabled={aanyaSending || !aanyaReplyText.trim()}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:opacity-85"
                      style={{
                        background:
                          aanyaSending || !aanyaReplyText.trim()
                            ? "#FFB6C8"
                            : "#FF8C9F",
                      }}
                      data-ocid="admin.submit_button"
                    >
                      {aanyaSending ? (
                        <span className="text-xs">…</span>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 18 18"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M2 9L16 2L10 9L16 16L2 9Z" fill="white" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
