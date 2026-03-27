import type { View } from "../App";

const navLinks = ["Home", "Explore", "Chat", "Create", "Account"];

interface TopNavProps {
  activeTab?: string;
  dpUrl?: string | null;
  onNav?: (tab: string) => void;
}

export default function TopNav({
  activeTab = "Home",
  dpUrl,
  onNav,
}: TopNavProps) {
  return (
    <nav
      style={{ background: "#FFFAF5", borderBottom: "1.5px solid #FFD1DC" }}
      className="w-full shadow-soft z-50"
    >
      <div className="flex items-center justify-between px-8 py-3 min-w-[1200px]">
        {/* Logo */}
        <div className="flex items-center gap-2" data-ocid="nav.link">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ boxShadow: "0 0 12px #FF8C9F88" }}
          >
            <img
              src="/assets/uploads/3fa58a27358a3cd2a338ec3578d3e777-019d2f05-0cec-72ee-b9a7-7b6fb53d74d6-1.jpg"
              alt="Chat Me Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <span
            className="text-xl font-bold"
            style={{ color: "#FF8C9F", fontFamily: "'Quicksand', sans-serif" }}
          >
            Chat Me
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              data-ocid={`nav.${link.toLowerCase()}.link`}
              onClick={() => onNav?.(link)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
              style={
                link === activeTab
                  ? { background: "#FFD1DC", color: "#FF8C9F" }
                  : { background: "transparent", color: "#5A4E4E" }
              }
            >
              {link}
            </button>
          ))}
        </div>

        {/* User area */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "#5A4E4E" }}>
            Lily 🌸
          </span>
          <button
            type="button"
            onClick={() => onNav?.("Account")}
            data-ocid="nav.account.button"
            className="relative hover:opacity-80 transition-all"
          >
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FFB6C1 0%, #C1E1FF 100%)",
              }}
            >
              {dpUrl ? (
                <img
                  src={dpUrl}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "18px" }}>🌸</span>
              )}
            </div>
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: "#4CAF50" }}
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
// re-export type for usage in other files
export type { View };
