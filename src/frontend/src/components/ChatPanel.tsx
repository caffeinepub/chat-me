import { useRef, useState } from "react";
import type { Message } from "../App";

const memberGrads = [
  "linear-gradient(135deg, #FFB6C1 0%, #C1E1FF 100%)",
  "linear-gradient(135deg, #FFD1A1 0%, #FFA0A0 100%)",
  "linear-gradient(135deg, #A0D4FF 0%, #C1A0FF 100%)",
];
const members = ["Lily", "Ben", "Sara"];

const senderGrad: Record<string, string> = {
  Lily: "linear-gradient(135deg, #FFB6C1 0%, #C1E1FF 100%)",
  Ben: "linear-gradient(135deg, #FFD1A1 0%, #FFA0A0 100%)",
  Sara: "linear-gradient(135deg, #A0D4FF 0%, #C1A0FF 100%)",
};

const imagePlaceholders: Record<string, string> = {
  "sara-chibi": "linear-gradient(135deg, #E8DFFF 0%, #FFD1DC 100%)",
  "ben-anime": "linear-gradient(135deg, #FFDDE6 0%, #FFB3C6 100%)",
};

interface ChatPanelProps {
  chatName: string;
  messages: Message[];
  onSend: (text: string) => void;
  onOpenChat?: () => void;
}

export default function ChatPanel({
  chatName,
  messages,
  onSend,
  onOpenChat,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col rounded-2xl shadow-card"
      style={{
        background: "#FFFAF5",
        border: "1.5px solid #FFD1DC",
        minWidth: "280px",
        maxWidth: "320px",
        width: "310px",
      }}
      data-ocid="chat.panel"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1.5px solid #FFD1DC" }}
      >
        <button
          type="button"
          onClick={onOpenChat}
          className="text-lg font-bold hover:opacity-70 transition-all"
          style={{ color: "#FF8C9F" }}
          data-ocid="chat.back.button"
        >
          ‹
        </button>
        <span
          className="font-bold text-base flex-1"
          style={{ color: "#1E1E1E" }}
        >
          #{chatName} 🎨
        </span>
        <div className="flex -space-x-2">
          {memberGrads.map((g, i) => (
            <div
              key={members[i]}
              className="w-7 h-7 rounded-full border-2 border-white"
              style={{ background: g }}
              title={members[i]}
            />
          ))}
        </div>
      </div>

      {/* Chat history */}
      <div
        className="flex flex-col gap-3 p-4 overflow-y-auto"
        style={{ height: "360px" }}
        data-ocid="chat.list"
      >
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.side === "right" ? "items-end" : "items-start"}`}
            data-ocid={`chat.item.${i + 1}`}
          >
            {msg.side === "left" && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ background: senderGrad[msg.sender] ?? "#FFD1DC" }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#5A4E4E" }}
                >
                  {msg.sender}
                </span>
              </div>
            )}
            <div
              className="px-3 py-2 rounded-2xl text-sm font-medium max-w-[90%]"
              style={{
                background: msg.side === "right" ? "#FFE0E8" : "#F5F0FF",
                color: "#1E1E1E",
              }}
            >
              {msg.text}
              {msg.image && (
                <div
                  className="mt-2 w-36 h-24 rounded-xl"
                  style={{
                    background: imagePlaceholders[msg.image] ?? "#FFD1DC",
                  }}
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              {msg.time && (
                <span className="text-[10px]" style={{ color: "#aaa" }}>
                  {msg.time}
                </span>
              )}
              {msg.side === "right" && (
                <span
                  className="text-[10px]"
                  style={{ color: msg.status === "read" ? "#4FC3F7" : "#aaa" }}
                >
                  {msg.status === "sent" ? "✓" : "✓✓"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        style={{ borderTop: "1.5px solid #FFD1DC" }}
      >
        <button
          type="button"
          className="p-1.5 rounded-full hover:opacity-70 transition-all"
          style={{ color: "#FF8C9F" }}
          data-ocid="chat.upload_button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="4"
              width="16"
              height="12"
              rx="2.5"
              fill="none"
              stroke="#FF8C9F"
              strokeWidth="1.3"
            />
            <circle
              cx="6"
              cy="9"
              r="2"
              fill="none"
              stroke="#FF8C9F"
              strokeWidth="1"
            />
            <path
              d="M11 12 L13 8 L16 12"
              stroke="#FF8C9F"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
        <button
          type="button"
          className="p-1.5 rounded-full hover:opacity-70 transition-all"
          style={{ color: "#FF8C9F" }}
          data-ocid="chat.emoji_button"
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
              r="7.5"
              fill="none"
              stroke="#FF8C9F"
              strokeWidth="1.3"
            />
            <circle cx="6.5" cy="7.5" r="1" fill="#FF8C9F" />
            <circle cx="11.5" cy="7.5" r="1" fill="#FF8C9F" />
            <path
              d="M6 11.5 Q9 14 12 11.5"
              stroke="#FF8C9F"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
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
          className="flex-1 px-3 py-1.5 rounded-full text-sm outline-none"
          style={{
            background: "#FFF5F8",
            border: "1.5px solid #FFD1DC",
            color: "#1E1E1E",
          }}
          data-ocid="chat.input"
        />
        <button
          type="button"
          onClick={handleSend}
          className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:opacity-85"
          style={{ background: "#FF8C9F" }}
          data-ocid="chat.submit_button"
        >
          Send
        </button>
      </div>
    </div>
  );
}
