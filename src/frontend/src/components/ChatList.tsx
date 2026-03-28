import { useState } from "react";
import type { View } from "../App";
import type { PublicUser } from "../backend.d";
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
  {
    name: "DM: Ben",
    avatar: "🌈",
    lastMsg: "Hey! Did you see my new artwork? 🎨",
    time: "9:30 AM",
    unread: 0,
    grad: "linear-gradient(135deg, #FFD1A1 0%, #FFA0A0 100%)",
  },
  {
    name: "DM: Sara",
    avatar: "🌸",
    lastMsg: "Hiiii 🌸 What are you drawing today?",
    time: "Yesterday",
    unread: 0,
    grad: "linear-gradient(135deg, #A0D4FF 0%, #C1A0FF 100%)",
  },
  {
    name: "DM: Mia",
    avatar: "🎀",
    lastMsg: "Can we collab on something cute? 🎀",
    time: "Mon",
    unread: 0,
    grad: "linear-gradient(135deg, #A0FFCA 0%, #A0D4FF 100%)",
  },
];

interface ChatListProps {
  token: string;
  currentUser: PublicUser | null;
  onOpenChat: (name: string) => void;
  onNav: (v: View) => void;
}

export default function ChatList({ onOpenChat, onNav }: ChatListProps) {
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

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
            onClick={() => alert("New chat coming soon! 🌸")}
            data-ocid="chatlist.open_modal_button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xl hover:opacity-85 transition-all"
            style={{ background: "#FF8C9F" }}
          >
            +
          </button>
        </div>
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
