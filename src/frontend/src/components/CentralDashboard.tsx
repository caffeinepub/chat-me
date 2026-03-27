import { KawaiiCamera, KawaiiHeart } from "./KawaiiDoodles";

const groups = [
  {
    name: "Art Buddies",
    emoji: "🎨",
    desc: "Share your artwork & get inspired!",
    online: 45,
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="5"
          width="18"
          height="18"
          rx="3"
          fill="#FFD1DC"
          stroke="#FF8C9F"
          strokeWidth="1.2"
        />
        <circle
          cx="20"
          cy="18"
          r="7"
          fill="#FFEEF2"
          stroke="#FF8C9F"
          strokeWidth="1.2"
        />
        <circle cx="20" cy="18" r="3.5" fill="#FF8C9F" />
        <path
          d="M5 16 L9 12 L13 15 L16 11"
          stroke="#FF8C9F"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    name: "Cute Pets Corner",
    emoji: "🐾",
    desc: "Adorable pet photos & stories!",
    online: 38,
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="14"
          cy="17"
          r="9"
          fill="#E8DFFF"
          stroke="#C1A0FF"
          strokeWidth="1.2"
        />
        <ellipse cx="9" cy="8" rx="3" ry="3.8" fill="#C1A0FF" />
        <ellipse cx="19" cy="8" rx="3" ry="3.8" fill="#C1A0FF" />
        <circle cx="11.5" cy="17" r="1.4" fill="#5A3E40" />
        <circle cx="16.5" cy="17" r="1.4" fill="#5A3E40" />
        <path
          d="M11.5 21 Q14 23 16.5 21"
          stroke="#5A3E40"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    name: "Meme Madness",
    emoji: "😂",
    desc: "The funniest memes around!",
    online: 72,
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="14"
          cy="14"
          r="12"
          fill="#FFF3C4"
          stroke="#FFD700"
          strokeWidth="1.2"
        />
        <circle cx="10" cy="12" r="1.5" fill="#5A3E40" />
        <circle cx="18" cy="12" r="1.5" fill="#5A3E40" />
        <path
          d="M8 18 Q14 24 20 18"
          stroke="#5A3E40"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    name: "Cosplay Crew",
    emoji: "🎭",
    desc: "Show off your costumes & crafts!",
    online: 29,
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <ellipse
          cx="10"
          cy="13"
          rx="7"
          ry="9"
          fill="#C1E1FF"
          stroke="#7BB8F5"
          strokeWidth="1.2"
        />
        <ellipse
          cx="20"
          cy="15"
          rx="6"
          ry="8"
          fill="#FFD1DC"
          stroke="#FF8C9F"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "Book Nook",
    emoji: "📚",
    desc: "Discuss your favorite reads!",
    online: 17,
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="6"
          y="14"
          width="16"
          height="11"
          rx="2"
          fill="#A0D4FF"
          stroke="#7BB8F5"
          strokeWidth="1.2"
        />
        <rect
          x="8"
          y="5"
          width="14"
          height="11"
          rx="2"
          fill="#FFDCA0"
          stroke="#FFB870"
          strokeWidth="1.2"
        />
        <line
          x1="10"
          y1="9"
          x2="20"
          y2="9"
          stroke="#FFB870"
          strokeWidth="0.8"
        />
        <line
          x1="10"
          y1="11"
          x2="18"
          y2="11"
          stroke="#FFB870"
          strokeWidth="0.8"
        />
      </svg>
    ),
  },
  {
    name: "Music Vibes",
    emoji: "🎵",
    desc: "Share playlists & discover music!",
    online: 53,
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 22 L12 8 L24 5 L24 19"
          stroke="#A0D4FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx="10"
          cy="22"
          r="4"
          fill="#C1A0FF"
          stroke="#A060FF"
          strokeWidth="1"
        />
        <circle
          cx="22"
          cy="19"
          r="4"
          fill="#A0D4FF"
          stroke="#7BB8F5"
          strokeWidth="1"
        />
      </svg>
    ),
  },
];

interface CentralDashboardProps {
  onJoinChat?: (chatName: string) => void;
}

export default function CentralDashboard({
  onJoinChat,
}: CentralDashboardProps) {
  return (
    <div className="flex flex-col gap-5 flex-1 min-w-0">
      {/* Welcome Banner */}
      <div
        className="flex items-center justify-between rounded-2xl p-6 shadow-soft"
        style={{ background: "#FFE6DB", border: "1.5px solid #FFD1DC" }}
      >
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "#1E1E1E", fontFamily: "'Quicksand', sans-serif" }}
          >
            Welcome to PixelPal! 🌸
          </h1>
          <p className="text-base font-semibold" style={{ color: "#5A4E4E" }}>
            Share. Chat. Smile!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <KawaiiCamera size={64} className="animate-float" />
          <KawaiiHeart
            size={58}
            className="animate-float"
            style={{ animationDelay: "1s" } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Group Card Grid */}
      <div className="grid grid-cols-2 gap-4">
        {groups.map((g, i) => (
          <div
            key={g.name}
            className="flex flex-col gap-3 p-4 rounded-2xl shadow-card"
            style={{ background: "#FFFAF5", border: "1.5px solid #FFD1DC" }}
            data-ocid={`dashboard.group.item.${i + 1}`}
          >
            <div className="flex items-center gap-2">
              {g.icon}
              <span
                className="font-bold text-base"
                style={{ color: "#1E1E1E" }}
              >
                {g.name} {g.emoji}
              </span>
            </div>
            <p className="text-xs" style={{ color: "#5A4E4E" }}>
              {g.desc}
            </p>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full self-start"
              style={{ background: "#FFEEF2", color: "#FF8C9F" }}
            >
              {g.online} online
            </span>
            <button
              type="button"
              onClick={() => onJoinChat?.(g.name)}
              className="w-full py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-85 mt-auto"
              style={{ background: "#FF8C9F" }}
              data-ocid={`dashboard.group_join.button.${i + 1}`}
            >
              Join Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
