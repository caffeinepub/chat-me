import { KawaiiCamera, KawaiiHeart } from "./KawaiiDoodles";

const friends = [
  { name: "Ben", grad: "linear-gradient(135deg, #FFD1A1 0%, #FFA0A0 100%)" },
  { name: "Sara", grad: "linear-gradient(135deg, #A0D4FF 0%, #C1A0FF 100%)" },
  { name: "Mia", grad: "linear-gradient(135deg, #A0FFCA 0%, #A0D4FF 100%)" },
];

interface LeftSidebarProps {
  onOpenChat?: (chatName: string) => void;
}

export default function LeftSidebar({ onOpenChat }: LeftSidebarProps) {
  return (
    <aside
      className="flex flex-col gap-5 p-4 rounded-2xl shadow-card h-full"
      style={{
        background: "#FFFAF5",
        border: "1.5px solid #FFD1DC",
        minWidth: "200px",
        maxWidth: "220px",
      }}
    >
      {/* Groups */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#FF8C9F" }}
        >
          Your Groups
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onOpenChat?.("Art Buddies")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:opacity-80 transition-all text-left"
            style={{ background: "#FFF0F4", border: "1px solid #FFD1DC" }}
            data-ocid="sidebar.art_buddies.button"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="4"
                width="14"
                height="14"
                rx="2"
                fill="#FFD1DC"
                stroke="#FF8C9F"
                strokeWidth="1"
              />
              <circle
                cx="16"
                cy="14"
                r="5"
                fill="#FFEEF2"
                stroke="#FF8C9F"
                strokeWidth="1"
              />
              <circle cx="16" cy="14" r="2.5" fill="#FF8C9F" />
              <path
                d="M5 13 L8 10 L11 12 L13 9"
                stroke="#FF8C9F"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span
              className="text-sm font-semibold"
              style={{ color: "#5A4E4E" }}
            >
              Art Buddies
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenChat?.("Cute Pets Corner")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:opacity-80 transition-all text-left"
            style={{ background: "#F5F0FF", border: "1px solid #C1E1FF" }}
            data-ocid="sidebar.cute_pets.button"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="13"
                r="7"
                fill="#E8DFFF"
                stroke="#C1A0FF"
                strokeWidth="1"
              />
              <ellipse cx="7" cy="7" rx="2.5" ry="3" fill="#C1A0FF" />
              <ellipse cx="15" cy="7" rx="2.5" ry="3" fill="#C1A0FF" />
              <circle cx="9" cy="13" r="1.2" fill="#5A3E40" />
              <circle cx="13" cy="13" r="1.2" fill="#5A3E40" />
              <path
                d="M9 16 Q11 18 13 16"
                stroke="#5A3E40"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M7 14 L5 14 M15 14 L17 14"
                stroke="#888"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>
            <span
              className="text-sm font-semibold"
              style={{ color: "#5A4E4E" }}
            >
              Cute Pets Corner
            </span>
          </button>
        </div>
      </div>

      {/* Friends */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#FF8C9F" }}
        >
          Online Friends
        </p>
        <div className="flex flex-col gap-2.5">
          {friends.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => onOpenChat?.(`DM: ${f.name}`)}
              className="flex items-center gap-2.5 px-2 hover:opacity-80 transition-all text-left"
              data-ocid={`sidebar.friend_${f.name.toLowerCase()}.button`}
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ background: f.grad }}
                />
                <div
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: "#4CAF50" }}
                />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: "#5A4E4E" }}
              >
                {f.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Decorative doodles */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-4">
        <KawaiiCamera size={54} className="animate-float" />
        <KawaiiHeart
          size={50}
          className="animate-float"
          style={{ animationDelay: "0.8s" } as React.CSSProperties}
        />
      </div>
    </aside>
  );
}
