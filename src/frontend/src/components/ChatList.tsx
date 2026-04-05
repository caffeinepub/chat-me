import { useEffect, useRef, useState } from "react";
import type { View } from "../App";
import type { ConversationInfo, PublicUser } from "../backend.d";
import { getActor, withRetry } from "../lib/actor";
import { PROACTIVE_MESSAGES } from "../utils/AanyaBot";
import BottomNav from "./BottomNav";

const AANYA_BOT_ID = 999999n;

// Play a soft notification sound using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore if audio not supported
  }
}

function loadContactsFromStorage(
  currentUser: PublicUser | null,
  token: string,
): ConversationInfo[] {
  const keys = [
    currentUser?.id != null ? `chatme_contacts_uid_${currentUser.id}` : "",
    token && !token.startsWith("demo-") ? `chatme_contacts_${token}` : "",
  ].filter(Boolean);

  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          lastTimestamp: BigInt(c.lastTimestamp ?? 0),
          otherUserId: BigInt(c.otherUserId ?? 0),
        }));
      }
    } catch {
      // try next key
    }
  }
  return [];
}

function saveContactsToStorage(
  currentUser: PublicUser | null,
  token: string,
  contacts: ConversationInfo[],
) {
  const serializable = contacts.map((c) => ({
    ...c,
    lastTimestamp: c.lastTimestamp.toString(),
    otherUserId: c.otherUserId.toString(),
  }));
  const json = JSON.stringify(serializable);

  if (currentUser?.id != null) {
    try {
      localStorage.setItem(`chatme_contacts_uid_${currentUser.id}`, json);
    } catch {
      // ignore storage errors
    }
  }
  if (token && !token.startsWith("demo-")) {
    try {
      localStorage.setItem(`chatme_contacts_${token}`, json);
    } catch {
      // ignore storage errors
    }
  }
}

function sortConversations(
  convs: ConversationInfo[],
  adminId?: bigint,
): ConversationInfo[] {
  return [...convs].sort((a, b) => {
    // Admin always first
    if (adminId !== undefined) {
      if (a.otherUserId === adminId) return -1;
      if (b.otherUserId === adminId) return 1;
    }
    // Aanya second (just after admin)
    if (a.otherUserId === AANYA_BOT_ID) return -1;
    if (b.otherUserId === AANYA_BOT_ID) return 1;
    return Number(b.lastTimestamp) - Number(a.lastTimestamp);
  });
}

function buildAanyaConv(currentUser: PublicUser): ConversationInfo {
  const myId = currentUser.id;
  const aId = myId < AANYA_BOT_ID ? myId : AANYA_BOT_ID;
  const bId = myId < AANYA_BOT_ID ? AANYA_BOT_ID : myId;
  return {
    chatId: `dm_${aId}_${bId}`,
    otherUserId: AANYA_BOT_ID,
    otherUserName: "Aanya",
    otherUserUsername: "aanya",
    otherUserAvatar: "🌸",
    lastMessage: "Heyyyy! 👋 Kya haal hai?",
    lastTimestamp: 1n,
  };
}

interface ChatListProps {
  token: string;
  currentUser: PublicUser | null;
  onOpenChat: (chatId: string, displayName: string) => void;
  onNav: (v: View) => void;
  activeChatId?: string | null;
  darkMode?: boolean;
}

export default function ChatList({
  token,
  currentUser,
  onOpenChat,
  onNav,
  activeChatId,
  darkMode = false,
}: ChatListProps) {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationInfo[]>(() =>
    loadContactsFromStorage(currentUser, token),
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const prevTimestamps = useRef<Record<string, bigint>>({});
  const [usernameSearch, setUsernameSearch] = useState("");
  const [foundUser, setFoundUser] = useState<PublicUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [showFindPanel, setShowFindPanel] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const adminId = 1n;
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reload from storage when currentUser becomes available
  useEffect(() => {
    if (!currentUser) return;
    const fromStorage = loadContactsFromStorage(currentUser, token);
    setConversations((prev) => {
      const merged = [...prev];
      for (const c of fromStorage) {
        if (!merged.some((m) => m.chatId === c.chatId)) merged.push(c);
      }
      // Always ensure Aanya is in the list
      const hasAanya = merged.some((c) => c.otherUserId === AANYA_BOT_ID);
      if (!hasAanya) merged.push(buildAanyaConv(currentUser));
      return sortConversations(merged, adminId);
    });
  }, [currentUser, token]);

  // Main polling effect
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const convs = await withRetry((actor) =>
          actor.getUserConversations(token),
        );
        const convList = convs as ConversationInfo[];

        setConversations((prev) => {
          if (convList.length === 0 && prev.length > 0) {
            saveContactsToStorage(currentUser, token, prev);
            return prev;
          }

          const merged = [...convList];
          for (const p of prev) {
            if (!merged.some((r) => r.chatId === p.chatId)) merged.push(p);
          }
          // Always ensure Aanya is present
          if (
            currentUser &&
            !merged.some((c) => c.otherUserId === AANYA_BOT_ID)
          ) {
            merged.push(buildAanyaConv(currentUser));
          }
          const sorted = sortConversations(merged, adminId);
          saveContactsToStorage(currentUser, token, sorted);
          return sorted;
        });

        // Update unread counts
        setUnreadCounts((prev) => {
          const updated = { ...prev };
          for (const c of convList) {
            const chatId = c.chatId;
            const prevTs = prevTimestamps.current[chatId];
            const newTs = c.lastTimestamp;
            if (
              prevTs !== undefined &&
              newTs > prevTs &&
              chatId !== activeChatId
            ) {
              updated[chatId] = (updated[chatId] ?? 0) + 1;
              playNotificationSound();
            }
            prevTimestamps.current[chatId] = newTs;
          }
          return updated;
        });

        // Check online status
        try {
          const actor = await getActor();
          const checks = await Promise.all(
            convList
              .filter((c) => c.otherUserId !== AANYA_BOT_ID)
              .map((c) =>
                actor
                  .isUserOnline(c.otherUserId)
                  .then((v: boolean) => ({
                    id: c.otherUserId.toString(),
                    online: v,
                  }))
                  .catch(() => ({
                    id: c.otherUserId.toString(),
                    online: false,
                  })),
              ),
          );
          setOnlineUsers(
            new Set<string>(
              checks
                .filter((x: { id: string; online: boolean }) => x.online)
                .map((x: { id: string; online: boolean }) => x.id),
            ),
          );
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    };
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [token, activeChatId, currentUser]);

  // Proactive message from Aanya after some time of inactivity
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — we only need to recheck when count changes
  useEffect(() => {
    if (!currentUser || !conversations.length) return;
    // Clean up any existing timer
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
      proactiveTimerRef.current = null;
    }

    const aanyaConv = conversations.find((c) => c.otherUserId === AANYA_BOT_ID);
    if (!aanyaConv) return;

    const lastTs = Number(aanyaConv.lastTimestamp);
    const now = Date.now() * 1_000_000; // nanoseconds
    const fiveMin = 5 * 60 * 1_000_000_000;

    if (now - lastTs > fiveMin || lastTs <= 1) {
      // Schedule a proactive message in 3-8 minutes
      const randomDelay = (3 + Math.random() * 5) * 60 * 1000;
      proactiveTimerRef.current = setTimeout(async () => {
        try {
          const randomMsg =
            PROACTIVE_MESSAGES[
              Math.floor(Math.random() * PROACTIVE_MESSAGES.length)
            ];
          const actor = await getActor();
          await actor.sendAanyaProactive(currentUser.id, randomMsg);
        } catch {
          // silent
        }
      }, randomDelay);
    }

    return () => {
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    };
  }, [currentUser, conversations.length]);

  const filteredConvs = conversations.filter(
    (c) =>
      c.otherUserName.toLowerCase().includes(search.toLowerCase()) ||
      c.otherUserUsername.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenChat = (chatId: string, displayName: string) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
    onOpenChat(chatId, displayName);
  };

  const handleFindUser = async () => {
    const uname = usernameSearch.replace("@", "").trim();
    if (!uname) return;
    setSearching(true);
    setFoundUser(null);
    setSearchErr("");
    try {
      const result = await withRetry((actor) => actor.getUserByUsername(uname));
      if (result && result.length > 0) {
        setFoundUser(result[0] as PublicUser);
      } else {
        setSearchErr("No user found with this username 😔");
      }
    } catch {
      setSearchErr("Could not search. Please try again 📡");
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (user: PublicUser) => {
    if (!currentUser || !token) return;
    setAddingFriend(true);
    try {
      const actor = await getActor();
      await actor.addFriend(token, user.id);
      setAddedFriends((prev) => new Set([...prev, user.id.toString()]));

      const myId = Number(currentUser.id);
      const theirId = Number(user.id);
      const chatId = `dm_${Math.min(myId, theirId)}_${Math.max(myId, theirId)}`;
      const newContact: ConversationInfo = {
        chatId,
        otherUserId: user.id,
        otherUserName: user.name,
        otherUserUsername: user.username,
        otherUserAvatar: user.avatarUrl,
        lastMessage: "Say hello! 👋",
        lastTimestamp: 0n,
      };
      setConversations((prev) => {
        if (prev.some((c) => c.chatId === chatId)) return prev;
        const updated = sortConversations([newContact, ...prev], adminId);
        saveContactsToStorage(currentUser, token, updated);
        return updated;
      });
    } catch {
      // ignore
    } finally {
      setAddingFriend(false);
    }
  };

  const handleStartChat = (user: PublicUser) => {
    if (!currentUser) return;
    const myId = Number(currentUser.id);
    const theirId = Number(user.id);
    const chatId = `dm_${Math.min(myId, theirId)}_${Math.max(myId, theirId)}`;
    const displayName = user.name;

    const newContact: ConversationInfo = {
      chatId,
      otherUserId: user.id,
      otherUserName: user.name,
      otherUserUsername: user.username,
      otherUserAvatar: user.avatarUrl,
      lastMessage: "Say hello! 👋",
      lastTimestamp: 0n,
    };

    setConversations((prev) => {
      if (prev.some((c) => c.chatId === chatId)) return prev;
      const updated = sortConversations([newContact, ...prev], adminId);
      saveContactsToStorage(currentUser, token, updated);
      return updated;
    });

    handleOpenChat(chatId, displayName);
    setShowFindPanel(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: darkMode
          ? "#0d0d0d"
          : "linear-gradient(160deg, #FFF5FA 0%, #EEE8FF 100%)",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        className="px-5 pt-6 pb-4"
        style={{ background: "#FFFAF5", borderBottom: "1.5px solid #FFD1DC" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "#FF8C9F" }}>
            Chats 💬
          </h1>
          <button
            type="button"
            onClick={() => setShowFindPanel(!showFindPanel)}
            data-ocid="chatlist.open_modal_button"
            className="flex items-center gap-1 px-3 py-2 rounded-full text-white font-bold text-xs hover:opacity-85 transition-all"
            style={{ background: "#FF8C9F" }}
          >
            🔍 Find by ID
          </button>
        </div>

        {/* Find user by username */}
        {showFindPanel && (
          <div
            className="mb-3 rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: darkMode ? "#1a1a1a" : "#F5F0FF",
              border: `1.5px solid ${darkMode ? "#444" : "#C4B5FD"}`,
            }}
          >
            <p className="text-xs font-bold" style={{ color: "#7A5AF8" }}>
              Find someone by their @username 💜
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{ color: "#7A5AF8" }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={usernameSearch}
                  onChange={(e) => setUsernameSearch(e.target.value)}
                  placeholder="username"
                  className="w-full pl-7 pr-3 py-2 rounded-full text-sm outline-none"
                  style={{
                    background: darkMode ? "#1a1a1a" : "white",
                    border: `1.5px solid ${darkMode ? "#444" : "#C4B5FD"}`,
                    color: darkMode ? "#f5f5f5" : "#1E1E1E",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFindUser()}
                  data-ocid="chatlist.search_input"
                />
              </div>
              <button
                type="button"
                onClick={handleFindUser}
                disabled={searching}
                className="px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                style={{ background: searching ? "#C4B5FD" : "#7A5AF8" }}
                data-ocid="chatlist.search_button"
              >
                {searching ? "..." : "Find"}
              </button>
            </div>

            {searchErr && (
              <p className="text-xs" style={{ color: "#C0304A" }}>
                {searchErr}
              </p>
            )}

            {foundUser && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: darkMode ? "#222" : "white",
                  border: `1.5px solid ${darkMode ? "#444" : "#C4B5FD"}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #E8DFFF 0%, #C4B5FD 100%)",
                  }}
                >
                  {foundUser.avatarUrl ? (
                    <img
                      src={foundUser.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm"
                    style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
                  >
                    {foundUser.name}
                  </p>
                  <p className="text-xs" style={{ color: "#7A5AF8" }}>
                    @{foundUser.username}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {currentUser && foundUser.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => handleAddFriend(foundUser)}
                      disabled={
                        addingFriend ||
                        addedFriends.has(foundUser.id.toString())
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                      style={{
                        background: addedFriends.has(foundUser.id.toString())
                          ? "#a3e635"
                          : "#7A5AF8",
                        minWidth: "64px",
                      }}
                      data-ocid="chatlist.add_friend_button"
                    >
                      {addedFriends.has(foundUser.id.toString())
                        ? "✓ Added"
                        : addingFriend
                          ? "..."
                          : "➕ Add"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartChat(foundUser)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                    style={{ background: "#FF8C9F" }}
                    data-ocid="chatlist.start_chat_button"
                  >
                    Chat 💬
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="relative">
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
            style={{ color: "#FF8C9F" }}
          >
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm outline-none"
            style={{
              background: darkMode ? "#1a1a1a" : "#F5F0FF",
              border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
              color: darkMode ? "#f5f5f5" : "#1E1E1E",
            }}
            data-ocid="chatlist.search_input"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConvs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="chatlist.empty_state"
          >
            <span className="text-4xl">💬</span>
            <p
              className="text-sm font-semibold"
              style={{ color: darkMode ? "#666" : "#BBA0A8" }}
            >
              {search ? "No chats found 🔍" : "No chats yet 🌸"}
            </p>
            <p
              className="text-xs text-center px-8"
              style={{ color: darkMode ? "#555" : "#CCA0B0" }}
            >
              {search
                ? "Try a different name"
                : 'Use "Find by ID" to start chatting with someone!'}
            </p>
          </div>
        ) : (
          filteredConvs.map((conv, i) => {
            const isAdmin = conv.otherUserId === adminId;
            const isAanya = conv.otherUserId === AANYA_BOT_ID;
            const unread = unreadCounts[conv.chatId] ?? 0;
            const isOnline = isAanya
              ? true // Aanya always appears online
              : onlineUsers.has(conv.otherUserId.toString());
            const isEmojiAvatar =
              isAanya ||
              (conv.otherUserAvatar.length <= 4 &&
                /\p{Emoji}/u.test(conv.otherUserAvatar));
            const initials = conv.otherUserName
              ? conv.otherUserName.slice(0, 2).toUpperCase()
              : "??";
            return (
              <button
                key={conv.chatId}
                type="button"
                onClick={() =>
                  handleOpenChat(
                    conv.chatId,
                    conv.otherUserName || conv.otherUserUsername,
                  )
                }
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:opacity-80 transition-all text-left"
                style={{
                  borderBottom: `1px solid ${darkMode ? "#1a1a1a" : "#FFF0F4"}`,
                  background: isAdmin
                    ? darkMode
                      ? "#1a0f1a"
                      : "#FFF5FC"
                    : isAanya
                      ? darkMode
                        ? "#1a1020"
                        : "#FEF3FF"
                      : "transparent",
                  outline: isAdmin
                    ? `1.5px solid ${darkMode ? "#6b21a8" : "#F0ABFC"}`
                    : isAanya
                      ? `1.5px solid ${darkMode ? "#9333ea40" : "#F0ABFC60"}`
                      : "none",
                }}
                data-ocid={`chatlist.item.${i + 1}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden"
                    style={{
                      background: isEmojiAvatar
                        ? isAanya
                          ? "linear-gradient(135deg, #FFD1DC 0%, #F0ABFC 100%)"
                          : "linear-gradient(135deg, #FFB6C1 0%, #C1A0FF 100%)"
                        : conv.otherUserAvatar
                          ? undefined
                          : "linear-gradient(135deg, #FFB6C1 0%, #C1A0FF 100%)",
                      border: isAdmin
                        ? "2px solid #F0ABFC"
                        : isAanya
                          ? "2px solid #FF8C9F"
                          : "none",
                      fontSize: isEmojiAvatar ? "24px" : "14px",
                    }}
                  >
                    {isEmojiAvatar ? (
                      <span>{conv.otherUserAvatar}</span>
                    ) : conv.otherUserAvatar ? (
                      <img
                        src={conv.otherUserAvatar}
                        alt={initials}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  {/* Online dot */}
                  {isOnline && (
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{
                        background: "#4CAF50",
                        borderColor: darkMode ? "#0d0d0d" : "white",
                      }}
                    />
                  )}
                  {/* Unread badge */}
                  {unread > 0 && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: "#FF4081" }}
                      data-ocid={`chatlist.item.${i + 1}`}
                    >
                      {unread > 9 ? "9+" : unread}
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="font-bold text-sm truncate"
                        style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
                      >
                        {conv.otherUserName || conv.otherUserUsername}
                      </span>
                      {conv.otherUserUsername && (
                        <span
                          className="text-xs font-semibold flex-shrink-0"
                          style={{ color: isAanya ? "#FF8C9F" : "#FF8C9F" }}
                        >
                          @{conv.otherUserUsername}
                        </span>
                      )}
                      {isAdmin && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: "#F0ABFC",
                            color: "#6b21a8",
                          }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    {conv.lastTimestamp > 1n && (
                      <span
                        className="text-[10px] flex-shrink-0"
                        style={{ color: darkMode ? "#666" : "#BBA0A8" }}
                      >
                        {new Date(
                          Number(conv.lastTimestamp) / 1_000_000,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: darkMode ? "#888" : "#7A6E6E" }}
                  >
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <BottomNav active="chats" onNav={onNav} darkMode={darkMode} />
    </div>
  );
}
