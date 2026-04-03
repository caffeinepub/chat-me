interface SplashScreenProps {
  darkMode?: boolean;
}

export default function SplashScreen({ darkMode = false }: SplashScreenProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: darkMode
          ? "#0d0d0d"
          : "linear-gradient(135deg, #FFE6DB 0%, #E8DFFF 50%, #FFD1DC 100%)",
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.03); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .splash-logo { animation: floatUp 2.4s ease-in-out infinite; }
        .splash-title { animation: fadeInUp 0.8s ease-out 0.3s both; }
        .splash-sub { animation: fadeInUp 0.8s ease-out 0.6s both; }
        .spark1 { animation: sparkle 1.5s 0.2s infinite; }
        .spark2 { animation: sparkle 1.5s 0.6s infinite; }
        .spark3 { animation: sparkle 1.5s 1.0s infinite; }
      `}</style>

      {/* Doodle background elements */}
      <span className="absolute top-16 left-20 text-4xl opacity-30 spark1">
        ✨
      </span>
      <span className="absolute top-24 right-24 text-3xl opacity-25 spark2">
        💫
      </span>
      <span className="absolute bottom-32 left-32 text-3xl opacity-20 spark3">
        🌸
      </span>
      <span className="absolute bottom-20 right-20 text-4xl opacity-25 spark1">
        ⭐
      </span>
      <span className="absolute top-40 left-1/4 text-2xl opacity-20 spark2">
        🌟
      </span>

      {/* Logo image */}
      <div className="splash-logo mb-6">
        <div
          className="w-32 h-32 rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 8px 32px #FF8C9F55" }}
        >
          <img
            src="/assets/uploads/92b049e7e6986de0dabd5a85eb518c30-019d32cb-469c-712f-b57e-9c8879b35386-1.jpg"
            alt="Chat Me Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      <h1
        className="splash-title text-5xl font-bold mb-2"
        style={{
          color: "#FF8C9F",
          fontFamily: "'Quicksand', sans-serif",
          letterSpacing: "-1px",
        }}
      >
        Chat Me
      </h1>
      <p
        className="splash-sub text-base font-semibold"
        style={{
          color: darkMode ? "#aaa" : "#7A6E6E",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        cute · lovely · friendly 🌸
      </p>
    </div>
  );
}
