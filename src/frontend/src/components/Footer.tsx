import { FloatingHeart } from "./KawaiiDoodles";

const heartPositions = [
  { left: 10, top: 20 },
  { left: 22, top: 40 },
  { left: 38, top: 20 },
  { left: 55, top: 60 },
  { left: 72, top: 40 },
  { left: 88, top: 20 },
];

interface FooterProps {
  darkMode?: boolean;
}

export default function Footer({ darkMode = false }: FooterProps) {
  const year = new Date().getFullYear();
  const host = typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      className="relative w-full py-4 px-8 flex items-center justify-between overflow-hidden"
      style={{
        background: darkMode ? "#111" : "#FFFAF5",
        borderTop: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
      }}
    >
      {/* Decorative hearts */}
      {heartPositions.map((pos) => (
        <FloatingHeart
          key={`heart-${pos.left}-${pos.top}`}
          size={14}
          color={pos.left % 22 === 0 ? "#FFD1DC" : "#FF8C9F"}
          className="absolute opacity-40 pointer-events-none"
          style={
            { left: `${pos.left}%`, top: `${pos.top}%` } as React.CSSProperties
          }
        />
      ))}

      {/* Links */}
      <div className="flex items-center gap-2 z-10">
        {["About", "Help", "Community"].map((link, i, arr) => (
          <span key={link} className="flex items-center gap-2">
            <button
              type="button"
              className="text-xs font-semibold hover:opacity-70 transition-all"
              style={{
                color: darkMode ? "#aaa" : "#5A4E4E",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              data-ocid={`footer.${link.toLowerCase()}.link`}
            >
              {link}
            </button>
            {i < arr.length - 1 && <FloatingHeart size={8} color="#FFD1DC" />}
          </span>
        ))}
        <span className="mx-2 text-xs" style={{ color: "#aaa" }}>
          ·
        </span>
        <span className="text-xs" style={{ color: "#aaa" }}>
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(host)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-all"
            style={{ color: "#FF8C9F" }}
          >
            Built with ❤️ using caffeine.ai
          </a>
        </span>
      </div>

      {/* Social icons */}
      <div className="flex items-center gap-2 z-10">
        <a
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-all"
          style={{ background: "#7289DA" }}
          data-ocid="footer.discord.button"
          aria-label="Discord"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="white"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M13.5 2.5A12.8 12.8 0 0 0 10.2 1.5c-.14.25-.3.58-.41.84a11.9 11.9 0 0 0-3.58 0C6.1 2.08 5.93 1.75 5.8 1.5A12.8 12.8 0 0 0 2.5 2.5C.36 5.7-.22 8.82.07 11.9a13 13 0 0 0 3.97 2.02c.32-.44.6-.9.84-1.4a8.4 8.4 0 0 1-1.33-.64l.33-.26a9.3 9.3 0 0 0 8.24 0l.33.26c-.43.25-.88.47-1.33.64.24.5.52.96.84 1.4A13 13 0 0 0 15.93 11.9c.34-3.55-.58-6.63-2.43-9.4ZM5.34 9.8c-.77 0-1.4-.71-1.4-1.58s.61-1.58 1.4-1.58c.78 0 1.41.71 1.4 1.58s-.62 1.58-1.4 1.58Zm5.32 0c-.77 0-1.4-.71-1.4-1.58s.61-1.58 1.4-1.58c.78 0 1.41.71 1.4 1.58s-.62 1.58-1.4 1.58Z" />
          </svg>
          <span className="sr-only">Discord</span>
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all"
          style={{ background: "#1877F2" }}
          data-ocid="footer.facebook.button"
          aria-label="Facebook"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="white"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 5.5V4c0-.55.45-1 1-1h1V1h-2C7.34 1 6 2.34 6 4v1.5H4V8h2v7h3V8h2l.5-2.5H9Z" />
          </svg>
          <span className="sr-only">Facebook</span>
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all"
          style={{
            background:
              "linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #FD9D3B 100%)",
          }}
          data-ocid="footer.instagram.button"
          aria-label="Instagram"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="white"
            strokeWidth="1.3"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="2" y="2" width="12" height="12" rx="3.5" />
            <circle cx="8" cy="8" r="3" />
            <circle cx="11.5" cy="4.5" r="0.8" fill="white" stroke="none" />
          </svg>
          <span className="sr-only">Instagram</span>
        </a>
      </div>
    </footer>
  );
}
