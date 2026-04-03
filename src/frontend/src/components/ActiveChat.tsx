import { useCallback, useEffect, useRef, useState } from "react";
import type { Message, View } from "../App";
import type { PublicUser } from "../backend.d";
import { getActor, withRetry } from "../lib/actor";
import BottomNav from "./BottomNav";

const senderGrad: Record<string, string> = {
  Lily: "linear-gradient(135deg, #FFB6C1 0%, #C1E1FF 100%)",
  Ben: "linear-gradient(135deg, #FFD1A1 0%, #FFA0A0 100%)",
  Sara: "linear-gradient(135deg, #A0D4FF 0%, #C1A0FF 100%)",
  Mia: "linear-gradient(135deg, #A0FFCA 0%, #A0D4FF 100%)",
};

const imagePlaceholders: Record<string, string> = {
  "sara-chibi": "linear-gradient(135deg, #E8DFFF 0%, #FFD1DC 100%)",
  "ben-anime": "linear-gradient(135deg, #FFDDE6 0%, #FFB3C6 100%)",
};

const chatEmoji: Record<string, string> = {
  "Art Buddies": "🎨",
  "Cute Pets Corner": "🐾",
  "Meme Madness": "😂",
  "Cosplay Crew": "🎭",
  "Book Nook": "📚",
  "Music Vibes": "🎵",
  "DM: Ben": "🌈",
  "DM: Sara": "🌸",
  "DM: Mia": "🎀",
};

const DOODLES = [
  { id: "d1", emoji: "💕", x: 8, y: 6, size: 32, rotate: -15 },
  { id: "d2", emoji: "✨", x: 25, y: 18, size: 28, rotate: 20 },
  { id: "d3", emoji: "🌸", x: 72, y: 8, size: 36, rotate: 10 },
  { id: "d4", emoji: "⭐", x: 88, y: 22, size: 30, rotate: -20 },
  { id: "d5", emoji: "💫", x: 15, y: 42, size: 26, rotate: 30 },
  { id: "d6", emoji: "🎀", x: 82, y: 45, size: 34, rotate: -10 },
  { id: "d7", emoji: "💗", x: 45, y: 12, size: 30, rotate: 15 },
  { id: "d8", emoji: "🌟", x: 60, y: 55, size: 32, rotate: -25 },
  { id: "d9", emoji: "🦋", x: 5, y: 68, size: 28, rotate: 5 },
  { id: "d10", emoji: "🌺", x: 90, y: 70, size: 36, rotate: -15 },
  { id: "d11", emoji: "💖", x: 35, y: 78, size: 30, rotate: 20 },
  { id: "d12", emoji: "🍓", x: 68, y: 82, size: 26, rotate: -10 },
  { id: "d13", emoji: "🌈", x: 20, y: 88, size: 32, rotate: 8 },
  { id: "d14", emoji: "🎵", x: 75, y: 35, size: 28, rotate: -30 },
  { id: "d15", emoji: "🌻", x: 50, y: 90, size: 34, rotate: 12 },
];

const GIF_EMOJIS = ["🐱", "💃", "🎉", "🌈", "🦄", "🍕", "🎨", "🌸"];
const STICKERS = [
  "🌸",
  "💕",
  "✨",
  "🎀",
  "🦋",
  "🍓",
  "🌈",
  "⭐",
  "🎉",
  "🥺",
  "💫",
  "🎨",
];

const WALLPAPER_PRESETS = [
  {
    id: "default",
    name: "Rose Dream",
    gradient: "linear-gradient(135deg, #FFF0F8 0%, #FFE0EE 50%, #F5E0FF 100%)",
    doodleColor: "#FFB6C1",
  },
  {
    id: "sunset",
    name: "Sunset Kiss",
    gradient: "linear-gradient(135deg, #FFE0B2 0%, #FFCCBC 40%, #F8BBD0 100%)",
    doodleColor: "#FFAB91",
  },
  {
    id: "ocean",
    name: "Sky Bliss",
    gradient: "linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 50%, #F3E5F5 100%)",
    doodleColor: "#90CAF9",
  },
  {
    id: "mint",
    name: "Mint Candy",
    gradient: "linear-gradient(135deg, #E0F7FA 0%, #E8F5E9 50%, #F0FFF0 100%)",
    doodleColor: "#80CBC4",
  },
  {
    id: "galaxy",
    name: "Galaxy Pop",
    gradient: "linear-gradient(135deg, #E8EAF6 0%, #EDE7F6 50%, #F3E5F5 100%)",
    doodleColor: "#B39DDB",
  },
  {
    id: "peach",
    name: "Peachy Soft",
    gradient: "linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 50%, #FBE9E7 100%)",
    doodleColor: "#FFCC80",
  },
];

const BUBBLE_SCHEMES = [
  {
    id: "pink",
    name: "Rose",
    sent: "linear-gradient(135deg, #FFD1DC 0%, #FFB6C8 100%)",
    received: "linear-gradient(135deg, #F0E6FF 0%, #E8DFFF 100%)",
  },
  {
    id: "blue",
    name: "Sky",
    sent: "linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)",
    received: "linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)",
  },
  {
    id: "green",
    name: "Mint",
    sent: "linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)",
    received: "linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)",
  },
  {
    id: "purple",
    name: "Lavender",
    sent: "linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%)",
    received: "linear-gradient(135deg, #F3E5F5 0%, #EDE7F6 100%)",
  },
  {
    id: "peach",
    name: "Peach",
    sent: "linear-gradient(135deg, #FFCCBC 0%, #FFAB91 100%)",
    received: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
  },
  {
    id: "rainbow",
    name: "Candy",
    sent: "linear-gradient(135deg, #FFD1DC 0%, #C5CAE9 100%)",
    received: "linear-gradient(135deg, #B2EBF2 0%, #C8E6C9 100%)",
  },
];

const getOtherUserId = (chatId: string, myId: number): number | null => {
  const match = chatId.match(/^dm_(\d+)_(\d+)$/);
  if (!match) return null;
  const a = Number.parseInt(match[1]);
  const b = Number.parseInt(match[2]);
  if (a === myId) return b;
  if (b === myId) return a;
  return null;
};

interface ActiveChatProps {
  chatId: string;
  chatName: string;
  token: string;
  currentUser: PublicUser | null;
  onBack: () => void;
  onNav: (v: View) => void;
  darkMode?: boolean;
}

export default function ActiveChat({
  chatId,
  chatName,
  token,
  currentUser,
  onBack,
  onNav,
  darkMode = false,
}: ActiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaTab, setMediaTab] = useState<"image" | "gif" | "sticker">(
    "image",
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [showBubblePicker, setShowBubblePicker] = useState(false);
  const [activeWallpaper, setActiveWallpaper] = useState("default");
  const [activeBubble, setActiveBubble] = useState("pink");
  const [sendError, setSendError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaPickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const currentWallpaper =
    WALLPAPER_PRESETS.find((w) => w.id === activeWallpaper) ??
    WALLPAPER_PRESETS[0];
  const currentBubble =
    BUBBLE_SCHEMES.find((b) => b.id === activeBubble) ?? BUBBLE_SCHEMES[0];

  // Load wallpaper and bubble from backend/localStorage on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const actor = await getActor();
        const wallpaperId = await (actor as any).getChatWallpaper(chatId);
        if (
          wallpaperId &&
          WALLPAPER_PRESETS.find((w) => w.id === wallpaperId)
        ) {
          setActiveWallpaper(wallpaperId);
        }
      } catch {
        // fallback to default
      }
      const savedBubble = localStorage.getItem(`chatme_bubble_${chatId}`);
      if (savedBubble && BUBBLE_SCHEMES.find((b) => b.id === savedBubble)) {
        setActiveBubble(savedBubble);
      }
    };
    loadPrefs();
  }, [chatId]);

  // Heartbeat: mark current user as online every 10 seconds
  useEffect(() => {
    if (!token) return;
    const sendHeartbeat = async () => {
      try {
        const actor = await getActor();
        await (actor as any).heartbeat(token);
      } catch {
        // silent
      }
    };
    sendHeartbeat();
    const id = setInterval(sendHeartbeat, 10000);
    return () => clearInterval(id);
  }, [token]);

  // Poll other user's online status every 5 seconds
  useEffect(() => {
    if (!currentUser) return;
    const myId = Number(currentUser.id);
    const otherUserId = getOtherUserId(chatId, myId);
    if (otherUserId === null) return;

    const checkOnline = async () => {
      try {
        const actor = await getActor();
        const online = await (actor as any).isUserOnline(BigInt(otherUserId));
        setIsOtherOnline(!!online);
      } catch {
        // ignore
      }
    };
    checkOnline();
    const id = setInterval(checkOnline, 5000);
    return () => clearInterval(id);
  }, [chatId, currentUser]);

  const backendToMessage = useCallback(
    (m: {
      id: bigint;
      chatId: string;
      senderId: bigint;
      senderName: string;
      text: string;
      imageUrl: string;
      timestamp: bigint;
    }): Message => {
      const isOwn = currentUserRef.current
        ? m.senderId === currentUserRef.current.id
        : false;
      return {
        id: Number(m.id),
        sender: m.senderName,
        side: isOwn ? "right" : "left",
        text: m.text,
        time: new Date(Number(m.timestamp) / 1_000_000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        imageUrl: m.imageUrl || undefined,
        status: isOwn ? "delivered" : undefined,
      };
    },
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const msgs = await withRetry((actor) => actor.getMessages(chatId));
        const converted = msgs.map(backendToMessage);
        setMessages(converted);
        lastCountRef.current = converted.length;
      } catch {
        // fallback
      }
    };
    load();
  }, [chatId, backendToMessage]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const msgs = await withRetry((actor) => actor.getMessages(chatId));
        if (msgs.length !== lastCountRef.current) {
          const converted = msgs.map(backendToMessage);
          setMessages(converted);
          lastCountRef.current = converted.length;
        }
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [chatId, backendToMessage]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!showMediaPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        mediaPickerRef.current &&
        !mediaPickerRef.current.contains(e.target as Node)
      ) {
        setShowMediaPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMediaPicker]);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleSelectWallpaper = async (wallpaperId: string) => {
    setActiveWallpaper(wallpaperId);
    setShowWallpaperPicker(false);
    try {
      const actor = await getActor();
      await (actor as any).setChatWallpaper(token, chatId, wallpaperId);
    } catch {
      // local-only fallback
    }
  };

  const handleSelectBubble = (bubbleId: string) => {
    setActiveBubble(bubbleId);
    localStorage.setItem(`chatme_bubble_${chatId}`, bubbleId);
    setShowBubblePicker(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setShowEmoji(false);
    setSendError("");
    inputRef.current?.focus();

    const optimisticId = Date.now();
    const optimisticMsg: Message = {
      id: optimisticId,
      sender: currentUser?.name ?? "You",
      side: "right",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const result = await withRetry((actor) =>
        actor.sendMessage(token, chatId, text, ""),
      );
      // result is [] | [bigint] — empty array means failure/session expired
      if (!result || result.length === 0) {
        // Revert optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setSessionExpired(true);
        setSendError(
          "Message failed to send. Your session may have expired — please log in again.",
        );
        return;
      }
      // Success: refresh messages from backend
      const msgs = await withRetry((actor) => actor.getMessages(chatId));
      const converted = msgs.map(backendToMessage);
      setMessages(converted);
      lastCountRef.current = converted.length;
    } catch {
      // Revert optimistic message on network error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setSendError(
        "Could not send message. Please check your connection and try again.",
      );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: currentUser?.name ?? "You",
          side: "right",
          text: "",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          imageUrl: url,
          status: "sent",
        },
      ]);
      setShowMediaPicker(false);
    }
    e.target.value = "";
  };

  const handleStickerSend = async (sticker: string) => {
    setShowMediaPicker(false);
    setSendError("");

    const optimisticId = Date.now();
    const optimisticMsg: Message = {
      id: optimisticId,
      sender: currentUser?.name ?? "You",
      side: "right",
      text: sticker,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const result = await withRetry((actor) =>
        actor.sendMessage(token, chatId, sticker, ""),
      );
      if (!result || result.length === 0) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setSessionExpired(true);
        setSendError(
          "Message failed to send. Your session may have expired — please log in again.",
        );
        return;
      }
      const msgs = await withRetry((actor) => actor.getMessages(chatId));
      const converted = msgs.map(backendToMessage);
      setMessages(converted);
      lastCountRef.current = converted.length;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setSendError(
        "Could not send sticker. Please check your connection and try again.",
      );
    }
  };

  const quickEmojis = [
    "❤️",
    "😊",
    "🎨",
    "✨",
    "🌸",
    "💕",
    "😂",
    "🥺",
    "🎀",
    "💫",
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: darkMode ? "#0d0d0d" : "#F8F0FF",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* CSS for twinkling animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1) rotate(var(--r)); }
          50% { opacity: 0.4; transform: scale(1.3) rotate(var(--r)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--r)); }
          50% { transform: translateY(-8px) rotate(var(--r)); }
        }
        .doodle-twinkle { animation: twinkle var(--dur, 3s) ease-in-out infinite; }
        .doodle-float { animation: float var(--dur, 4s) ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0"
        style={{
          background: darkMode
            ? "#111"
            : "linear-gradient(135deg, #FFF0F8 0%, #F5EEFF 100%)",
          borderBottom: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
          zIndex: 50,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="activechat.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:opacity-70"
          style={{
            color: "#FF8C9F",
            background: darkMode ? "#222" : "#FFF0F4",
          }}
        >
          ←
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)",
          }}
        >
          {chatEmoji[chatName] ?? "💬"}
        </div>
        <div className="flex-1">
          <p
            className="font-bold text-sm"
            style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
          >
            {chatName}
          </p>
          <p
            className="text-xs"
            style={{ color: isOtherOnline ? "#22c55e" : "#aaa" }}
          >
            {isOtherOnline ? "🟢 Online" : "⚫ Offline"} · {messages.length}{" "}
            messages
          </p>
        </div>

        {/* 3-dot dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            data-ocid="activechat.dropdown_menu"
            onClick={() => setShowDropdown((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg hover:opacity-70 transition-all"
            style={{
              color: "#7A6E6E",
              background: showDropdown
                ? "#FFD1DC"
                : darkMode
                  ? "#222"
                  : "#F5F0FF",
            }}
          >
            ⋯
          </button>
          {showDropdown && (
            <div
              className="absolute right-0 top-11 rounded-2xl overflow-hidden shadow-xl"
              style={{
                background: darkMode ? "#1a1a1a" : "#FFF5FB",
                border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
                minWidth: "180px",
                zIndex: 100,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowWallpaperPicker(true);
                  setShowDropdown(false);
                }}
                data-ocid="activechat.wallpaper.button"
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:opacity-80 transition-all text-left"
                style={{ color: "#7A5C8C", borderBottom: "1px solid #FFE4F0" }}
              >
                🎨 Change Wallpaper
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBubblePicker(true);
                  setShowDropdown(false);
                }}
                data-ocid="activechat.bubble.button"
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:opacity-80 transition-all text-left"
                style={{ color: "#7A5C8C" }}
              >
                💬 Change Bubble Color
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session expired banner */}
      {sessionExpired && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{
            background: darkMode ? "#1a1a1a" : "#FFF0F0",
            borderBottom: "1.5px solid #FFAAAA",
          }}
          data-ocid="activechat.error_state"
        >
          <p
            className="text-xs font-semibold flex-1"
            style={{ color: "#C0304A" }}
          >
            ⚠️ Session expired. Please go back and log in again.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all flex-shrink-0"
            style={{ background: "#FF8C9F" }}
            data-ocid="activechat.back.button"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Send error banner */}
      {sendError && !sessionExpired && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2"
          style={{
            background: darkMode ? "#2a1a1a" : "#FFF5F0",
            borderBottom: "1.5px solid #FFCCAA",
          }}
          data-ocid="activechat.error_state"
        >
          <p
            className="text-xs font-semibold flex-1"
            style={{ color: "#C06030" }}
          >
            ⚠️ {sendError}
          </p>
          <button
            type="button"
            onClick={() => setSendError("")}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-70 flex-shrink-0"
            style={{ background: "#FFE4D0", color: "#C06030" }}
            data-ocid="activechat.close_button"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 relative"
        style={{
          background: currentWallpaper.gradient,
          minHeight: "calc(100vh - 200px)",
        }}
        data-ocid="activechat.list"
      >
        {/* Decorative kawaii doodles */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {DOODLES.map((d, i) => {
            const istwinkle = i % 3 === 0;
            const dur = 2.5 + ((i * 0.4) % 3);
            return (
              <span
                key={d.id}
                className={istwinkle ? "doodle-twinkle" : "doodle-float"}
                style={{
                  position: "absolute",
                  fontSize: `${d.size}px`,
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  ["--r" as string]: `${d.rotate}deg`,
                  ["--dur" as string]: `${dur}s`,
                  opacity: 0.22,
                  filter: `drop-shadow(0 0 4px ${currentWallpaper.doodleColor}88)`,
                  animationDelay: `${(i * 0.35) % 2}s`,
                }}
              >
                {d.emoji}
              </span>
            );
          })}
        </div>

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-2 relative z-10 ${msg.side === "right" ? "flex-row-reverse" : "flex-row"}`}
            data-ocid={`activechat.item.${i + 1}`}
          >
            {msg.side === "left" && (
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 self-end"
                style={{ background: senderGrad[msg.sender] ?? "#FFD1DC" }}
              />
            )}
            <div
              className={`flex flex-col gap-0.5 max-w-[70%] ${msg.side === "right" ? "items-end" : "items-start"}`}
            >
              {msg.side === "left" && (
                <span
                  className="text-xs font-semibold px-1"
                  style={{ color: "#FF8C9F" }}
                >
                  {msg.sender}
                </span>
              )}
              <div
                className="px-4 py-2.5 text-sm font-medium"
                style={{
                  background:
                    msg.side === "right"
                      ? currentBubble.sent
                      : darkMode
                        ? "#2a2a2a"
                        : currentBubble.received,
                  color: "#1E1E1E",
                  borderRadius:
                    msg.side === "right"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                  boxShadow: "0 2px 8px rgba(255,140,159,0.12)",
                }}
              >
                {msg.text && <span>{msg.text}</span>}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Sent media"
                    className="mt-2 rounded-xl object-cover"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      display: "block",
                    }}
                  />
                )}
                {msg.image && !msg.imageUrl && (
                  <div
                    className="mt-2 w-48 h-32 rounded-xl"
                    style={{
                      background: imagePlaceholders[msg.image] ?? "#FFD1DC",
                    }}
                  />
                )}
              </div>
              <div className="flex items-center gap-1 px-1">
                <span className="text-[10px]" style={{ color: "#aaa" }}>
                  {msg.time}
                </span>
                {msg.side === "right" && (
                  <span
                    className="text-[10px]"
                    style={{
                      color: msg.status === "read" ? "#4FC3F7" : "#aaa",
                    }}
                  >
                    {msg.status === "sent" ? "✓" : "✓✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Media picker */}
      {showMediaPicker && (
        <div
          ref={mediaPickerRef}
          className="mx-4 mb-2"
          style={{
            background: darkMode ? "#1a1a1a" : "#FFFAF5",
            border: `2px solid ${darkMode ? "#333" : "#FFD1DC"}`,
            borderRadius: "24px",
            padding: "16px",
            zIndex: 20,
          }}
          data-ocid="activechat.popover"
        >
          <div className="flex gap-2 mb-3">
            {(["image", "gif", "sticker"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMediaTab(tab)}
                className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background:
                    mediaTab === tab
                      ? "#FF8C9F"
                      : darkMode
                        ? "#222"
                        : "#FFF0F4",
                  color: mediaTab === tab ? "#fff" : "#FF8C9F",
                }}
              >
                {tab === "image"
                  ? "📷 Image"
                  : tab === "gif"
                    ? "🎞️ GIF"
                    : "🎀 Sticker"}
              </button>
            ))}
          </div>
          {mediaTab === "image" && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl text-sm font-bold hover:opacity-85 transition-all"
                style={{
                  background: darkMode ? "#222" : "#FFF0F4",
                  color: "#FF8C9F",
                  border: "1.5px dashed #FFD1DC",
                }}
                data-ocid="activechat.upload_button"
              >
                📁 Choose Image / Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </div>
          )}
          {mediaTab === "gif" && (
            <div className="grid grid-cols-4 gap-2">
              {GIF_EMOJIS.map((gif) => (
                <button
                  key={gif}
                  type="button"
                  onClick={() => handleStickerSend(gif)}
                  className="flex items-center justify-center h-12 rounded-xl hover:scale-125 transition-transform text-3xl"
                  style={{ background: darkMode ? "#222" : "#FFF0F4" }}
                >
                  {gif}
                </button>
              ))}
            </div>
          )}
          {mediaTab === "sticker" && (
            <div className="grid grid-cols-4 gap-2">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => handleStickerSend(sticker)}
                  className="flex items-center justify-center h-12 rounded-xl hover:scale-125 transition-transform text-2xl"
                  style={{ background: darkMode ? "#222" : "#FFF0F4" }}
                >
                  {sticker}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showEmoji && (
        <div
          className="flex flex-wrap gap-2 px-4 py-3"
          style={{ background: "#FFF5F8", borderTop: "1px solid #FFD1DC" }}
        >
          {quickEmojis.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setInput((prev) => prev + e)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 sticky bottom-[80px]"
        style={{
          background: darkMode
            ? "rgba(20,20,20,0.95)"
            : "rgba(255,250,245,0.9)",
          backdropFilter: "blur(2px)",
          borderTop: "1.5px solid #FFD1DC",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowMediaPicker((v) => !v);
            setShowEmoji(false);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-all flex-shrink-0"
          style={{
            background: showMediaPicker
              ? "#FFD1DC"
              : darkMode
                ? "#222"
                : "#FFF0F4",
            color: "#FF8C9F",
          }}
          data-ocid="activechat.open_modal_button"
          aria-label="Attach file or sticker"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="9"
              cy="9"
              r="7"
              stroke="#FF8C9F"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M9 5V13M5 9H13"
              stroke="#FF8C9F"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
          style={{
            background: darkMode ? "#1a1a1a" : "#FFF5F8",
            border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
            color: "#1E1E1E",
          }}
          data-ocid="activechat.input"
        />
        <button
          type="button"
          onClick={() => {
            setShowEmoji((v) => !v);
            setShowMediaPicker(false);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl hover:opacity-70 transition-all flex-shrink-0"
          style={{ background: "#FFF0F4" }}
          data-ocid="activechat.emoji_button"
          aria-label="Emoji picker"
        >
          😊
        </button>
        <button
          type="button"
          onClick={handleSend}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-85 transition-all flex-shrink-0"
          style={{ background: "#FF8C9F" }}
          data-ocid="activechat.submit_button"
          aria-label="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 9L16 2L10 9L16 16L2 9Z" fill="white" />
          </svg>
        </button>
      </div>

      <BottomNav active="chat" onNav={onNav} darkMode={darkMode} />

      {/* Wallpaper Picker Modal */}
      {showWallpaperPicker && (
        <div
          className="fixed inset-0 flex items-end justify-center"
          role="presentation"
          style={{ zIndex: 200, background: "rgba(0,0,0,0.3)" }}
          onKeyDown={(e) => e.key === "Escape" && setShowWallpaperPicker(false)}
          onClick={() => setShowWallpaperPicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ background: "#FFF5FB", border: "2px solid #FFD1DC" }}
            data-ocid="activechat.wallpaper.modal"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: "#7A5C8C" }}>
                🎨 Choose Wallpaper
              </h3>
              <button
                type="button"
                onKeyDown={(e) =>
                  e.key === "Escape" && setShowWallpaperPicker(false)
                }
                onClick={() => setShowWallpaperPicker(false)}
                data-ocid="activechat.wallpaper.close_button"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
                style={{
                  background: "#FFE4F0",
                  color: "#FF8C9F",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPER_PRESETS.map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => handleSelectWallpaper(wp.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all hover:scale-105"
                  style={{
                    border:
                      activeWallpaper === wp.id
                        ? "2.5px solid #FF8C9F"
                        : "2px solid #FFD1DC",
                    background: "white",
                  }}
                >
                  <div
                    className="w-full h-16 rounded-xl"
                    style={{ background: wp.gradient }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#7A5C8C" }}
                  >
                    {wp.name}
                  </span>
                  {activeWallpaper === wp.id && (
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: "#FF8C9F" }}
                    >
                      ✓ Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bubble Color Picker Modal */}
      {showBubblePicker && (
        <div
          className="fixed inset-0 flex items-end justify-center"
          role="presentation"
          style={{ zIndex: 200, background: "rgba(0,0,0,0.3)" }}
          onKeyDown={(e) => e.key === "Escape" && setShowBubblePicker(false)}
          onClick={() => setShowBubblePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ background: "#FFF5FB", border: "2px solid #FFD1DC" }}
            data-ocid="activechat.bubble.modal"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: "#7A5C8C" }}>
                💬 Choose Bubble Color
              </h3>
              <button
                type="button"
                onKeyDown={(e) =>
                  e.key === "Escape" && setShowBubblePicker(false)
                }
                onClick={() => setShowBubblePicker(false)}
                data-ocid="activechat.bubble.close_button"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
                style={{
                  background: "#FFE4F0",
                  color: "#FF8C9F",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BUBBLE_SCHEMES.map((scheme) => (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => handleSelectBubble(scheme.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all hover:scale-105"
                  style={{
                    border:
                      activeBubble === scheme.id
                        ? "2.5px solid #FF8C9F"
                        : "2px solid #FFD1DC",
                    background: "white",
                  }}
                >
                  <div
                    className="w-full h-8 rounded-xl"
                    style={{ background: scheme.sent }}
                  />
                  <div
                    className="w-full h-8 rounded-xl"
                    style={{ background: scheme.received }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#7A5C8C" }}
                  >
                    {scheme.name}
                  </span>
                  {activeBubble === scheme.id && (
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: "#FF8C9F" }}
                    >
                      ✓ Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
