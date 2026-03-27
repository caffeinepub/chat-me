import type { View } from "../App";

interface BottomNavProps {
  active: "home" | "chats" | "chat" | "account";
  onNav: (v: View) => void;
}

export default function BottomNav({ active, onNav }: BottomNavProps) {
  const tabs = [
    {
      key: "home" as const,
      label: "Home",
      view: "home" as View,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 10L10 3L17 10V18H13V13H7V18H3V10Z" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "chats" as const,
      label: "Chats",
      view: "chatList" as View,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 4C2 3 3 2 4 2H16C17 2 18 3 18 4V13C18 14 17 15 16 15H11L7 18V15H4C3 15 2 14 2 13V4Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      key: "chat" as const,
      label: "Chat",
      view: "activeChat" as View,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M7 10H13M10 7V13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      key: "account" as const,
      label: "Account",
      view: "profile" as View,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="10" cy="7" r="4" fill="currentColor" />
          <path
            d="M3 18C3 14.7 6.1 12 10 12C13.9 12 17 14.7 17 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3"
      style={{
        background: "#FFFAF5",
        borderTop: "1.5px solid #FFD1DC",
        zIndex: 200,
        boxShadow: "0 -4px 20px rgba(255,140,159,0.1)",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onNav(tab.view)}
          data-ocid={`bottomnav.${tab.key}.link`}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-all"
          style={{
            background: active === tab.key ? "#FFD1DC" : "transparent",
            color: active === tab.key ? "#FF8C9F" : "#7A6E6E",
          }}
        >
          {tab.icon}
          <span className="text-xs font-semibold">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
