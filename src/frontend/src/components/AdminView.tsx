import { useEffect, useState } from "react";
import type { View } from "../App";
import type { AdminStats, PublicUser } from "../backend.d";
import { getActor } from "../lib/actor";

interface AdminViewProps {
  token: string;
  onBack: () => void;
  onNav: (v: View) => void;
}

export default function AdminView({ token, onBack }: AdminViewProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const actor = await getActor();
        const result = await actor.adminGetStats(token);
        const data = result[0] ?? null;
        if (data) {
          setStats(data);
        } else {
          setError("Access denied or no data 💔");
        }
      } catch {
        setError("Failed to load stats 💔");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "40px",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: "#FFFAF5", borderBottom: "1.5px solid #FFD1DC" }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="admin.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:opacity-70 transition-all"
          style={{ background: "#FFF0F4", color: "#FF8C9F" }}
        >
          ←
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#FF8C9F" }}>
          Admin Panel 👑
        </h1>
      </div>

      <div className="flex flex-col px-5 py-6 gap-5 max-w-2xl mx-auto w-full">
        {loading && (
          <div
            className="flex flex-col items-center py-20"
            data-ocid="admin.loading_state"
          >
            <span className="text-4xl animate-spin">✿</span>
            <p
              className="mt-3 text-sm font-semibold"
              style={{ color: "#7A6E6E" }}
            >
              Loading stats...
            </p>
          </div>
        )}
        {error && (
          <div
            className="px-4 py-3 rounded-2xl text-sm font-semibold text-center"
            style={{ background: "#FFD1DC", color: "#C0304A" }}
            data-ocid="admin.error_state"
          >
            {error}
          </div>
        )}
        {stats && (
          <>
            <div
              className="rounded-3xl p-6 flex flex-col items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)",
                boxShadow: "0 8px 30px rgba(255,140,159,0.2)",
              }}
              data-ocid="admin.card"
            >
              <span className="text-5xl font-bold" style={{ color: "#FF8C9F" }}>
                {Number(stats.userCount)}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "#5A4E4E" }}
              >
                Registered Users 🌸
              </span>
            </div>
            <div
              className="rounded-3xl p-5 flex flex-col gap-3"
              style={{
                background: "rgba(255,250,245,0.9)",
                border: "1.5px solid #FFD1DC",
                boxShadow: "0 4px 20px rgba(255,140,159,0.1)",
              }}
            >
              <h2
                className="font-bold text-base mb-1"
                style={{ color: "#1E1E1E" }}
              >
                All Users 👥
              </h2>
              {stats.users.length === 0 && (
                <div className="text-center py-8" data-ocid="admin.empty_state">
                  <span className="text-3xl">🌸</span>
                  <p className="text-sm mt-2" style={{ color: "#7A6E6E" }}>
                    No users yet
                  </p>
                </div>
              )}
              {stats.users.map((user: PublicUser, i: number) => (
                <div
                  key={Number(user.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: "#FFF5F8",
                    border: "1.5px solid #FFE6DB",
                  }}
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)",
                    }}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      "🌸"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-sm"
                        style={{ color: "#1E1E1E" }}
                      >
                        {user.name}
                      </span>
                      {user.isAdmin && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "#FF8C9F", color: "#fff" }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: "#7A6E6E" }}
                    >
                      {user.phone}
                    </p>
                    <p className="text-[10px]" style={{ color: "#aaa" }}>
                      Joined {formatDate(user.joinedAt)}
                    </p>
                  </div>
                  <div
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: "#E8DFFF", color: "#7A5AF8" }}
                  >
                    #{Number(user.id)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
