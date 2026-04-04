import { useEffect, useState } from "react";
import type { ConversationInfo, PublicUser } from "../backend.d";
import { getActor, withRetry } from "../lib/actor";
import { KawaiiCamera, KawaiiHeart } from "./KawaiiDoodles";

interface LeftSidebarProps {
  onOpenChat?: (chatName: string) => void;
  token?: string;
  darkMode?: boolean;
  currentUserId?: bigint;
}

export default function LeftSidebar({
  onOpenChat,
  token,
  darkMode = false,
  currentUserId,
}: LeftSidebarProps) {
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        // Fetch both conversations and friends in parallel
        const [convs, friends] = await Promise.all([
          withRetry((actor) => actor.getUserConversations(token)).catch(
            () => [] as ConversationInfo[],
          ),
          withRetry((actor) => actor.getMyFriends(token)).catch(
            () => [] as PublicUser[],
          ),
        ]);

        const convList = convs as ConversationInfo[];
        const friendList = friends as PublicUser[];

        // Build a set of otherUserIds already in convList
        const existingIds = new Set(
          convList.map((c) => c.otherUserId.toString()),
        );

        // For friends not yet in conversations, create synthetic ConversationInfo
        const syntheticConvs: ConversationInfo[] = friendList
          .filter((f) => !existingIds.has(f.id.toString()))
          .map((f) => {
            // Compute shared dm chatId — need both user IDs
            let chatId: string;
            if (currentUserId !== undefined) {
              const a = currentUserId < f.id ? currentUserId : f.id;
              const b = currentUserId < f.id ? f.id : currentUserId;
              chatId = `dm_${a}_${b}`;
            } else {
              chatId = `friend_${f.id}`;
            }
            return {
              chatId,
              otherUserId: f.id,
              otherUserName: f.name,
              otherUserUsername: f.username,
              otherUserAvatar: f.avatarUrl,
              lastMessage: "",
              lastTimestamp: BigInt(0),
            };
          });

        const merged = [...convList, ...syntheticConvs];
        setConversations(merged);

        // Check online status for all merged users
        try {
          const actor = await getActor();
          const checks = await Promise.all(
            merged.map((c) =>
              actor
                .isUserOnline(c.otherUserId)
                .then((v: boolean) => ({
                  id: c.otherUserId.toString(),
                  online: v,
                }))
                .catch(() => ({ id: c.otherUserId.toString(), online: false })),
            ),
          );
          setOnlineUsers(
            new Set<string>(
              checks
                .filter((x: { id: string; online: boolean }) => x.online)
                .map((x: { id: string; online: boolean }) => x.id),
            ),
          );
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [token, currentUserId]);

  return (
    <aside
      className="flex flex-col gap-5 p-4 rounded-2xl shadow-card h-full"
      style={{
        background: darkMode ? "#1a1a1a" : "#FFFAF5",
        border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
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
            style={{
              background: darkMode ? "#222" : "#FFF0F4",
              border: `1px solid ${darkMode ? "#333" : "#FFD1DC"}`,
            }}
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
              style={{ color: darkMode ? "#ccc" : "#5A4E4E" }}
            >
              Art Buddies
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenChat?.("Cute Pets Corner")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:opacity-80 transition-all text-left"
            style={{
              background: darkMode ? "#222" : "#F5F0FF",
              border: `1px solid ${darkMode ? "#333" : "#C1E1FF"}`,
            }}
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
              style={{ color: darkMode ? "#ccc" : "#5A4E4E" }}
            >
              Cute Pets Corner
            </span>
          </button>
        </div>
      </div>

      {/* My Friends — all added friends */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#FF8C9F" }}
        >
          My Friends
        </p>
        <div className="flex flex-col gap-2.5">
          {conversations.length === 0 ? (
            <p
              className="text-xs"
              style={{ color: darkMode ? "#666" : "#BBA0A8" }}
            >
              No friends added yet 🌸
            </p>
          ) : (
            conversations.map((f) => {
              const initials = f.otherUserName
                ? f.otherUserName.slice(0, 2).toUpperCase()
                : "??";
              return (
                <button
                  key={f.chatId}
                  type="button"
                  onClick={() => onOpenChat?.(f.chatId)}
                  className="flex items-center gap-2.5 px-2 hover:opacity-80 transition-all text-left"
                  data-ocid="sidebar.friend.button"
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                      style={{
                        background: f.otherUserAvatar
                          ? undefined
                          : "linear-gradient(135deg, #FFB6C1 0%, #C1A0FF 100%)",
                      }}
                    >
                      {f.otherUserAvatar ? (
                        <img
                          src={f.otherUserAvatar}
                          alt={initials}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    {onlineUsers.has(f.otherUserId.toString()) && (
                      <div
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ background: "#4CAF50" }}
                      />
                    )}
                  </div>
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: darkMode ? "#ccc" : "#5A4E4E" }}
                  >
                    {f.otherUserName}
                  </span>
                </button>
              );
            })
          )}
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
