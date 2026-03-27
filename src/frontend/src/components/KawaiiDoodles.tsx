export function KawaiiHeart({
  size = 60,
  className = "",
  style,
}: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M30 50 C30 50 8 36 8 20 C8 13 13 8 20 8 C24 8 27.5 10 30 13.5 C32.5 10 36 8 40 8 C47 8 52 13 52 20 C52 36 30 50 30 50Z"
        fill="#FFB3C6"
        stroke="#FF8C9F"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="25" r="2.5" fill="#5A3E40" />
      <circle cx="36" cy="25" r="2.5" fill="#5A3E40" />
      <circle cx="25" cy="23.5" r="1" fill="white" />
      <circle cx="37" cy="23.5" r="1" fill="white" />
      <path
        d="M24 32 Q30 38 36 32"
        stroke="#5A3E40"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="19" cy="31" rx="4" ry="2.5" fill="#FFB3C6" opacity="0.6" />
      <ellipse cx="41" cy="31" rx="4" ry="2.5" fill="#FFB3C6" opacity="0.6" />
    </svg>
  );
}

export function KawaiiCamera({
  size = 60,
  className = "",
  style,
}: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect
        x="8"
        y="20"
        width="44"
        height="30"
        rx="7"
        fill="#FFD1DC"
        stroke="#FF8C9F"
        strokeWidth="1.5"
      />
      <rect
        x="22"
        y="14"
        width="16"
        height="8"
        rx="4"
        fill="#FFB3C6"
        stroke="#FF8C9F"
        strokeWidth="1.5"
      />
      <circle
        cx="30"
        cy="35"
        r="10"
        fill="#FFEEF2"
        stroke="#FF8C9F"
        strokeWidth="1.5"
      />
      <circle
        cx="30"
        cy="35"
        r="6.5"
        fill="#C1E1FF"
        stroke="#A0CAFF"
        strokeWidth="1"
      />
      <circle cx="30" cy="35" r="3" fill="#7BB8F5" />
      <circle cx="27.5" cy="32.5" r="1.2" fill="white" opacity="0.8" />
      <circle
        cx="46"
        cy="26"
        r="3"
        fill="#FFB3C6"
        stroke="#FF8C9F"
        strokeWidth="1"
      />
      <path
        d="M50 14 L51 11 L52 14 L55 15 L52 16 L51 19 L50 16 L47 15 Z"
        fill="#FFD1A0"
      />
      <path
        d="M43 10 L43.8 8 L44.6 10 L46.6 10.8 L44.6 11.6 L43.8 13.6 L43 11.6 L41 10.8 Z"
        fill="#FFB3C6"
      />
    </svg>
  );
}

export function StarBurst({
  size = 20,
  className = "",
  color = "#FFD1A0",
}: { size?: number; className?: string; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 1 L11.5 8 L18 10 L11.5 12 L10 19 L8.5 12 L2 10 L8.5 8 Z"
        fill={color}
      />
    </svg>
  );
}

export function FloatingHeart({
  size = 18,
  className = "",
  color = "#FF8C9F",
  style,
}: {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M9 15.5 C9 15.5 1.5 10.5 1.5 6 C1.5 3.5 3.5 1.5 6 1.5 C7.4 1.5 8.6 2.2 9 3 C9.4 2.2 10.6 1.5 12 1.5 C14.5 1.5 16.5 3.5 16.5 6 C16.5 10.5 9 15.5 9 15.5Z"
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
}
