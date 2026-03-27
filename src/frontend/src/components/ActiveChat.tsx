import { useEffect, useRef, useState } from "react";
import type { Message, View } from "../App";
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

const DOODLES = ["💕", "✨", "🌸", "⭐", "💫", "🎀", "💗", "🌟"];

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

interface ActiveChatProps {
  chatName: string;
  messages: Message[];
  onSend: (text: string, imageUrl?: string) => void;
  onBack: () => void;
  onNav: (v: View) => void;
}

export default function ActiveChat({
  chatName,
  messages,
  onSend,
  onBack,
  onNav,
}: ActiveChatProps) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaTab, setMediaTab] = useState<"image" | "gif" | "sticker">(
    "image",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaPickerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Close media picker on outside click
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

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSend("", url);
      setShowMediaPicker(false);
    }
    // Reset so same file can be selected again
    e.target.value = "";
  };

  const handleStickerSend = (sticker: string) => {
    onSend(sticker);
    setShowMediaPicker(false);
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
        background: "#F8F0FF",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0"
        style={{
          background: "linear-gradient(135deg, #FFF0F8 0%, #F5EEFF 100%)",
          borderBottom: "1.5px solid #FFD1DC",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="activechat.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:opacity-70"
          style={{ color: "#FF8C9F", background: "#FFF0F4" }}
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
          <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>
            {chatName}
          </p>
          <p className="text-xs" style={{ color: "#FF8C9F" }}>
            🟢 online · {messages.length} messages
          </p>
        </div>
        <button
          type="button"
          data-ocid="activechat.dropdown_menu"
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg hover:opacity-70 transition-all"
          style={{ color: "#7A6E6E", background: "#F5F0FF" }}
        >
          ⋯
        </button>
      </div>

      {/* Wallpaper + messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 relative"
        style={{
          background: [
            "radial-gradient(circle at 15% 25%, #FFD1DC33 0%, transparent 40%)",
            "radial-gradient(circle at 85% 75%, #E8DFFF33 0%, transparent 40%)",
            "radial-gradient(circle at 50% 50%, #FFF0F833 0%, transparent 60%)",
            "radial-gradient(circle at 30% 80%, #FFE6DB44 0%, transparent 35%)",
            "radial-gradient(circle at 70% 20%, #F0E6FF33 0%, transparent 35%)",
          ].join(", "),
          backgroundColor: "#FFF5FB",
          minHeight: "calc(100vh - 200px)",
        }}
        data-ocid="activechat.list"
      >
        {/* Decorative doodles */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {DOODLES.map((e, i) => (
            <span
              key={e}
              className="absolute text-2xl"
              style={{
                opacity: 0.15,
                left: `${10 + ((i * 17) % 80)}%`,
                top: `${5 + ((i * 23) % 80)}%`,
              }}
            >
              {e}
            </span>
          ))}
        </div>

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-2 relative z-10 ${
              msg.side === "right" ? "flex-row-reverse" : "flex-row"
            }`}
            data-ocid={`activechat.item.${i + 1}`}
          >
            {msg.side === "left" && (
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 self-end"
                style={{ background: senderGrad[msg.sender] ?? "#FFD1DC" }}
              />
            )}
            <div
              className={`flex flex-col gap-0.5 max-w-[70%] ${
                msg.side === "right" ? "items-end" : "items-start"
              }`}
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
                      ? "linear-gradient(135deg, #FFD1DC 0%, #FFB6C8 100%)"
                      : "linear-gradient(135deg, #F0E6FF 0%, #E8DFFF 100%)",
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

      {/* Media picker popup */}
      {showMediaPicker && (
        <div
          ref={mediaPickerRef}
          className="mx-4 mb-2"
          style={{
            background: "#FFFAF5",
            border: "2px solid #FFD1DC",
            borderRadius: "24px",
            padding: "16px",
            zIndex: 20,
          }}
          data-ocid="activechat.popover"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            {(["image", "gif", "sticker"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMediaTab(tab)}
                className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: mediaTab === tab ? "#FF8C9F" : "#FFF0F4",
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

          {/* Image tab */}
          {mediaTab === "image" && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl text-sm font-bold hover:opacity-85 transition-all"
                style={{
                  background: "#FFF0F4",
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

          {/* GIF tab */}
          {mediaTab === "gif" && (
            <div className="grid grid-cols-4 gap-2">
              {GIF_EMOJIS.map((gif) => (
                <button
                  key={gif}
                  type="button"
                  onClick={() => handleStickerSend(gif)}
                  className="flex items-center justify-center h-12 rounded-xl hover:scale-125 transition-transform text-3xl"
                  style={{
                    background: "#FFF0F4",
                    animation: "bounce 1s infinite",
                  }}
                >
                  {gif}
                </button>
              ))}
            </div>
          )}

          {/* Sticker tab */}
          {mediaTab === "sticker" && (
            <div className="grid grid-cols-4 gap-2">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => handleStickerSend(sticker)}
                  className="flex items-center justify-center h-12 rounded-xl hover:scale-125 transition-transform text-2xl"
                  style={{ background: "#FFF0F4" }}
                >
                  {sticker}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emoji picker */}
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
          background: "rgba(255,250,245,0.9)",
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
            background: showMediaPicker ? "#FFD1DC" : "#FFF0F4",
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
            background: "#FFF5F8",
            border: "1.5px solid #FFD1DC",
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

      <BottomNav active="chat" onNav={onNav} />
    </div>
  );
}
