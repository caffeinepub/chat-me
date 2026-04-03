const creations = [
  {
    title: "Pencil Sketch Study",
    creator: "@artlover99",
    grad: "linear-gradient(135deg, #FFF3E0 0%, #FFD1A0 100%)",
    likes: 124,
    comments: 32,
    shares: 18,
  },
  {
    title: "Red Hair Portrait",
    creator: "@pixelgirl",
    grad: "linear-gradient(135deg, #FFD1DC 0%, #FF9BB5 100%)",
    likes: 98,
    comments: 21,
    shares: 11,
  },
  {
    title: "Chibi Friends",
    creator: "@saradraws",
    grad: "linear-gradient(135deg, #E8DFFF 0%, #C1E1FF 100%)",
    likes: 156,
    comments: 44,
    shares: 27,
  },
];

interface FeaturedCreationsProps {
  darkMode?: boolean;
}

export default function FeaturedCreations({
  darkMode = false,
}: FeaturedCreationsProps) {
  return (
    <aside
      className="flex flex-col gap-4 p-4 rounded-2xl shadow-card"
      style={{
        background: darkMode ? "#1a1a1a" : "#FFFAF5",
        border: `1.5px solid ${darkMode ? "#333" : "#C1E1FF"}`,
        minWidth: "200px",
        maxWidth: "220px",
      }}
      data-ocid="featured.panel"
    >
      <h2
        className="font-bold text-base"
        style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
      >
        ✨ Featured Creations
      </h2>

      {creations.map((c, i) => (
        <div
          key={c.title}
          className="flex flex-col gap-2 p-3 rounded-2xl"
          style={{
            background: darkMode ? "#222" : "#FFFAF5",
            border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
          }}
          data-ocid={`featured.item.${i + 1}`}
        >
          <div
            className="w-full h-24 rounded-xl"
            style={{ background: c.grad }}
          />
          <div>
            <p
              className="font-bold text-sm"
              style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
            >
              {c.title}
            </p>
            <p
              className="text-xs"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
            >
              {c.creator}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-all"
              style={{ color: "#FF8C9F" }}
              data-ocid={`featured.like.button.${i + 1}`}
            >
              ❤️ {c.likes}
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-all"
              style={{ color: "#7BB8F5" }}
              data-ocid={`featured.comment.button.${i + 1}`}
            >
              💬 {c.comments}
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-all"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
              data-ocid={`featured.share.button.${i + 1}`}
            >
              🔗 {c.shares}
            </button>
          </div>
        </div>
      ))}
    </aside>
  );
}
