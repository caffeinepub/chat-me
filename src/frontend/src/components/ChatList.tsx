import { useState } from "react";
import type { View } from "../App";
import type { PublicUser } from "../backend.d";
import { getActor } from "../lib/actor";
import BottomNav from "./BottomNav";

const chats = [
  {
    name: "Art Buddies",
    avatar: "🎨",
    lastMsg: "Sara: 💗✨😊",
    time: "2:34 PM",
    unread: 3,
    grad: "linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 100%)",
  },
  {
    name: "Cute Pets Corner",
    avatar: "🐾",
    lastMsg: "Mia: So adorable! 😍🐾",
    time: "1:12 PM",
    unread: 0,
    grad: "linear-gradient(135deg, #E8DFFF 0%, #C1A0FF 100%)",
  },
  {
    name: "Meme Madness",
    avatar: "😂",
    lastMsg: "Ben: This meme is too real 😂",
    time: "11:45 AM",
    unread: 5,
    grad: "linear-gradient(135deg, #FFF3C4 0%, #FFD700 100%)",
  },
  {
    name: "Cosplay Crew",
    avatar: "🎭",
    lastMsg: "Mia: Just finished my outfit!!",
    time: "3:20 PM",
    unread: 1,
    grad: "linear-gradient(135deg, #C1E1FF 0%, #7BB8F5 100%)",
  },
  {
    name: "Book Nook",
    avatar: "📚",
    lastMsg: "Mia: Yes!! It's magical 🌟",
    time: "10:08 AM",
    unread: 0,
    grad: "linear-gradient(135deg, #A0D4FF 0%, #FFDCA0 100%)",
  },
];

interface ChatListProps {
  token: string;
  currentUser: PublicUser | null;
  onOpenChat: (name: string) => void;
  onNav: (v: View) => void;
}

export default function ChatList({
  token: _token,
  onOpenChat,
  onNav,
}: ChatListProps) {
  const [search, setSearch] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [foundUser, setFoundUser] = useState<PublicUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [showFindPanel, setShowFindPanel] = useState(false);

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleFindUser = async () => {
    const uname = usernameSearch.replace("@", "").trim();
    if (!uname) return;
    setSearching(true);
    setFoundUser(null);
    setSearchErr("");
    try {
      const actor = await getActor();
      const result = await actor.getUserByUsername(uname);
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

  const handleStartChat = (user: PublicUser) => {
    onOpenChat(`DM: @${user.username}`);
    setShowFindPanel(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #FFF5FA 0%, #EEE8FF 100%)",
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
            style={{ background: "#F5F0FF", border: "1.5px solid #C4B5FD" }}
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
                    background: "white",
                    border: "1.5px solid #C4B5FD",
                    color: "#1E1E1E",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFindUser()}
                  data-ocid="chatlist.username_search_input"
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
                style={{ background: "white", border: "1.5px solid #C4B5FD" }}
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
                  <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>
                    {foundUser.name}
                  </p>
                  <p className="text-xs" style={{ color: "#7A5AF8" }}>
                    @{foundUser.username}
                  </p>
                </div>
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
            )}
          </div>
        )}

        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="5" stroke="#FF8C9F" strokeWidth="1.5" />
            <path
              d="M11 11 L14 14"
              stroke="#FF8C9F"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm outline-none"
            style={{
              background: "#FFF5F8",
              border: "1.5px solid #FFD1DC",
              color: "#1E1E1E",
            }}
            data-ocid="chatlist.search_input"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex flex-col px-4 py-3 gap-1">
        {filtered.length === 0 && (
          <div
            className="flex flex-col items-center py-16"
            data-ocid="chatlist.empty_state"
          >
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-sm font-semibold" style={{ color: "#7A6E6E" }}>
              No chats found
            </p>
          </div>
        )}
        {filtered.map((chat, i) => (
          <button
            key={chat.name}
            type="button"
            onClick={() => onOpenChat(chat.name)}
            data-ocid={`chatlist.item.${i + 1}`}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:opacity-85 text-left"
            style={{ background: "#FFFAF5", border: "1.5px solid #FFD1DC" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: chat.grad }}
            >
              {chat.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className="font-bold text-sm"
                  style={{ color: "#1E1E1E" }}
                >
                  {chat.name}
                </span>
                <span className="text-xs" style={{ color: "#aaa" }}>
                  {chat.time}
                </span>
              </div>
              <p
                className="text-xs truncate mt-0.5"
                style={{ color: "#7A6E6E" }}
              >
                {chat.lastMsg}
              </p>
            </div>
            {chat.unread > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: "#FF8C9F" }}
              >
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <BottomNav active="chats" onNav={onNav} />
    </div>
  );
}
