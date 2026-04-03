import type React from "react";
import { useRef, useState } from "react";
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

const BANNER_BG_KEY = "chatme_banner_bg";

interface CentralDashboardProps {
  onJoinChat?: (chatName: string) => void;
  currentUser?: { name: string } | null;
  darkMode?: boolean;
}

export default function CentralDashboard({
  onJoinChat,
  currentUser,
  darkMode = false,
}: CentralDashboardProps) {
  const [bannerBg, setBannerBg] = useState<string | null>(() =>
    localStorage.getItem(BANNER_BG_KEY),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBannerBg(dataUrl);
      localStorage.setItem(BANNER_BG_KEY, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBannerBg = () => {
    setBannerBg(null);
    localStorage.removeItem(BANNER_BG_KEY);
  };

  const bannerStyle: React.CSSProperties = bannerBg
    ? {
        backgroundImage: `url(${bannerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1.5px solid #FFD1DC",
      }
    : {
        background: darkMode ? "#1a1a1a" : "#FFE6DB",
        border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
      };

  return (
    <div className="flex flex-col gap-5 flex-1 min-w-0">
      {/* Welcome Banner */}
      <div
        className="relative flex items-center justify-between rounded-2xl p-6 shadow-soft overflow-hidden"
        style={bannerStyle}
      >
        {/* Overlay for readability when custom image is set */}
        {bannerBg && (
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.55)" }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          <h1
            className="text-3xl font-bold mb-1"
            style={{
              color: darkMode ? "#f5f5f5" : "#1E1E1E",
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            Welcome, {currentUser?.name ?? "Friend"}! 🌸
          </h1>
          <p
            className="text-base font-semibold"
            style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
          >
            Share. Chat. Smile!
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <KawaiiCamera size={64} className="animate-float" />
          <KawaiiHeart
            size={58}
            className="animate-float"
            style={{ animationDelay: "1s" } as React.CSSProperties}
          />
        </div>

        {/* Banner background controls */}
        <div className="absolute top-3 right-3 z-20 flex gap-2 items-center">
          {bannerBg && (
            <button
              type="button"
              onClick={handleRemoveBannerBg}
              title="Remove custom background"
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow transition-all hover:scale-110"
              style={{
                background: "rgba(255,140,159,0.88)",
                color: "#fff",
                fontWeight: 700,
              }}
              data-ocid="dashboard.banner.delete_button"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Change banner background"
            className="flex items-center gap-1 shadow transition-all hover:scale-105 hover:opacity-95"
            style={{
              background: "rgba(255,100,130,0.88)",
              color: "#fff",
              borderRadius: "20px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 700,
            }}
            data-ocid="dashboard.banner.upload_button"
          >
            🖼️ <span>Change Photo</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerImageChange}
          data-ocid="dashboard.banner.dropzone"
        />
      </div>

      {/* Group Card Grid */}
      <div className="grid grid-cols-2 gap-4">
        {groups.map((g, i) => (
          <div
            key={g.name}
            className="flex flex-col gap-3 p-4 rounded-2xl shadow-card"
            style={{
              background: darkMode ? "#1a1a1a" : "#FFFAF5",
              border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
            }}
            data-ocid={`dashboard.group.item.${i + 1}`}
          >
            <div className="flex items-center gap-2">
              {g.icon}
              <span
                className="font-bold text-base"
                style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
              >
                {g.name} {g.emoji}
              </span>
            </div>
            <p
              className="text-xs"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
            >
              {g.desc}
            </p>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full self-start"
              style={{
                background: darkMode ? "#2a1520" : "#FFEEF2",
                color: "#FF8C9F",
              }}
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
