import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRef, useState } from "react";
import type { View } from "../App";
import type { PublicUser } from "../backend.d";
import { getActor } from "../lib/actor";
import BottomNav from "./BottomNav";

interface ProfileViewProps {
  dpUrl: string | null;
  onDpChange: (url: string) => void;
  token: string;
  currentUser: PublicUser | null;
  onBack: () => void;
  onNav: (v: View) => void;
  onLogout: () => void;
  onUserUpdate: (user: PublicUser) => void;
  darkMode?: boolean;
}

export default function ProfileView({
  dpUrl,
  onDpChange,
  token,
  currentUser,
  onBack,
  onNav,
  onLogout,
  onUserUpdate,
  darkMode = false,
}: ProfileViewProps) {
  const [name, setName] = useState(currentUser?.name ?? "🌸");
  const [about, setAbout] = useState(
    currentUser?.about ?? "Drawing cute things everyday 🎨",
  );
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempAbout, setTempAbout] = useState(about);
  const [tempUsername, setTempUsername] = useState(currentUser?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<
    "" | "checking" | "available" | "taken" | "invalid"
  >("");
  const [lastSeen, setLastSeen] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMsg = (type: "ok" | "err", text: string) => {
    setSaveMsg({ type, text });
    if (type === "ok") {
      setTimeout(() => setSaveMsg(null), 3000);
    }
    // Error messages persist until user interacts
  };

  const handleDpClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Resize & compress to ~200KB max before saving as base64
    const resized = await new Promise<string>((resolve) => {
      const img = new Image();
      const blobUrl = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 300;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(blobUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = blobUrl;
    });
    // Show immediately in UI
    onDpChange(resized);
    // Save to backend permanently
    try {
      const actor = await getActor();
      await actor.updateProfile(token, name, about, resized);
      if (currentUser) onUserUpdate({ ...currentUser, avatarUrl: resized });
      showMsg("ok", "Profile photo saved! ✓");
    } catch {
      showMsg("err", "Photo upload failed. Try again.");
    }
  };

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const actor = await getActor();
      const ok = await actor.updateProfile(
        token,
        tempName,
        about,
        currentUser?.avatarUrl ?? "",
      );
      if (ok) {
        setName(tempName);
        setEditingName(false);
        if (currentUser) onUserUpdate({ ...currentUser, name: tempName });
        showMsg("ok", "Name saved! ✓");
      } else {
        showMsg("err", "Session expired. Please log in again.");
      }
    } catch {
      showMsg("err", "Could not connect. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const actor = await getActor();
      const ok = await actor.updateProfile(
        token,
        name,
        tempAbout,
        currentUser?.avatarUrl ?? "",
      );
      if (ok) {
        setAbout(tempAbout);
        setEditingAbout(false);
        if (currentUser) onUserUpdate({ ...currentUser, about: tempAbout });
        showMsg("ok", "About saved! ✓");
      } else {
        showMsg("err", "Session expired. Please log in again.");
      }
    } catch {
      showMsg("err", "Could not connect. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const checkUsername = async (uname: string) => {
    setSaveMsg(null); // Clear any existing error when user starts editing
    setTempUsername(uname);
    if (uname.length < 3) {
      setUsernameStatus("");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      setUsernameStatus("invalid");
      return;
    }
    if (uname === currentUser?.username) {
      setUsernameStatus("available");
      return;
    }
    setUsernameStatus("checking");
    try {
      const actor = await getActor();
      const ok = await actor.isUsernameAvailablePublic(uname);
      setUsernameStatus(ok ? "available" : "taken");
    } catch {
      setUsernameStatus("");
    }
  };

  const handleSaveUsername = async () => {
    if (usernameStatus !== "available") return;
    if (!token) {
      showMsg("err", "Session expired. Please log out and log in again.");
      return;
    }
    setSaving(true);
    try {
      const actor = await getActor();
      const result = await actor.setUsername(token, tempUsername);
      if ("ok" in result) {
        // Re-fetch from backend to confirm the change actually persisted
        try {
          const profileResult = await actor.getMyProfile(token);
          if (profileResult && profileResult.length > 0) {
            const freshUser = profileResult[0] as PublicUser;
            onUserUpdate(freshUser);
          } else {
            if (currentUser)
              onUserUpdate({ ...currentUser, username: tempUsername });
          }
        } catch {
          if (currentUser)
            onUserUpdate({ ...currentUser, username: tempUsername });
        }
        setEditingUsername(false);
        setUsernameStatus("");
        showMsg("ok", "Username saved! ✓");
      } else if ("err" in result) {
        // Reset status so save button is disabled; user must re-type to re-check
        setUsernameStatus("");
        showMsg("err", `Save failed: ${result.err as string}`);
      }
    } catch {
      setUsernameStatus("");
      showMsg(
        "err",
        "Could not connect to server. Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const usernameHint = {
    "": "",
    checking: "Checking...",
    available: "✓ Available!",
    taken: "✗ Already taken",
    invalid: "Only letters, numbers, underscore (3-20 chars)",
  }[usernameStatus];

  const usernameHintColor = {
    "": "#7A6E6E",
    checking: "#7A6E6E",
    available: "#2E8B57",
    taken: "#C0304A",
    invalid: "#C0304A",
  }[usernameStatus];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #FFE6DB 0%, #E8DFFF 100%)",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "80px",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: darkMode ? "#111" : "#FFFAF5",
          borderBottom: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="profile.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:opacity-70 transition-all"
          style={{
            background: darkMode ? "#222" : "#FFF0F4",
            color: "#FF8C9F",
          }}
        >
          ←
        </button>
        <h1 className="text-xl font-bold flex-1" style={{ color: "#FF8C9F" }}>
          Profile 🌸
        </h1>
        <button
          type="button"
          onClick={onLogout}
          data-ocid="profile.logout.button"
          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-85"
          style={{ background: "#FFD1DC", color: "#C0304A" }}
        >
          Logout 👋
        </button>
      </div>

      {/* Save feedback toast */}
      {saveMsg && (
        <div
          className="mx-4 mt-2 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-between gap-2 transition-all"
          style={{
            background: saveMsg.type === "ok" ? "#D4F5E9" : "#FFE0E6",
            color: saveMsg.type === "ok" ? "#1A7A4A" : "#C0304A",
            border: `1.5px solid ${saveMsg.type === "ok" ? "#A8E6CF" : "#FFB3C1"}`,
          }}
        >
          <span>{saveMsg.text}</span>
          {saveMsg.type === "err" && (
            <button
              type="button"
              onClick={() => setSaveMsg(null)}
              className="text-base font-bold opacity-60 hover:opacity-100 shrink-0"
              data-ocid="profile.error_state"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col items-center px-5 py-8 gap-6">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-5xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FFB6C1 0%, #C1E1FF 100%)",
              border: "4px solid #FF8C9F",
              boxShadow: "0 0 20px #FF8C9F44",
            }}
          >
            {dpUrl ? (
              <img
                src={dpUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              "🌸"
            )}
          </div>
          <button
            type="button"
            onClick={handleDpClick}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm hover:opacity-85 transition-all"
            style={{ background: "#FF8C9F" }}
            data-ocid="profile.upload_button"
            title="Change profile picture"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Unique ID badge */}
        {currentUser && (
          <div className="flex flex-col items-center gap-1">
            <div
              className="px-5 py-2 rounded-full text-sm font-bold"
              style={{ background: "#E8DFFF", color: "#7A5AF8" }}
            >
              Your ID: @
              {currentUser.username || `user${Number(currentUser.id)}`}
            </div>
            <p
              className="text-xs"
              style={{ color: darkMode ? "#888" : "#7A6E6E" }}
            >
              Share this ID with friends to chat 💬
            </p>
          </div>
        )}

        {/* Info card */}
        <div
          className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "#FFFAF5",
            border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
            boxShadow: "0 4px 20px rgba(255,140,159,0.1)",
          }}
        >
          {/* Username field */}
          <div>
            <Label
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#7A5AF8" }}
            >
              Username (Your ID)
            </Label>
            {editingUsername ? (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                      style={{ color: "#7A5AF8" }}
                    >
                      @
                    </span>
                    <input
                      value={tempUsername}
                      onChange={(e) =>
                        checkUsername(
                          e.target.value
                            .replace(/[^a-zA-Z0-9_]/g, "")
                            .slice(0, 20),
                        )
                      }
                      className="w-full pl-7 pr-3 py-2 rounded-full text-sm outline-none"
                      style={{
                        background: "#F5F0FF",
                        border: "1.5px solid #C4B5FD",
                        color: darkMode ? "#f5f5f5" : "#1E1E1E",
                      }}
                      placeholder="your_username"
                      maxLength={20}
                      data-ocid="profile.username_input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveUsername}
                    disabled={saving || usernameStatus !== "available"}
                    className="px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                    style={{
                      background:
                        saving || usernameStatus !== "available"
                          ? "#C4B5FD"
                          : "#7A5AF8",
                    }}
                    data-ocid="profile.username_save_button"
                  >
                    {saving ? "✿" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUsername(false);
                      setUsernameStatus("");
                      setSaveMsg(null);
                      setTempUsername(currentUser?.username ?? "");
                    }}
                    className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-85 transition-all"
                    style={{
                      background: "#F5F0FF",
                      color: darkMode ? "#888" : "#7A6E6E",
                    }}
                  >
                    ✕
                  </button>
                </div>
                {usernameHint && (
                  <p
                    className="text-xs px-2"
                    style={{ color: usernameHintColor }}
                  >
                    {usernameHint}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span
                  className="text-base font-semibold"
                  style={{ color: "#7A5AF8" }}
                >
                  @
                  {currentUser?.username ||
                    `user${Number(currentUser?.id ?? 0)}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempUsername(currentUser?.username ?? "");
                    setSaveMsg(null);
                    setEditingUsername(true);
                  }}
                  className="text-sm hover:opacity-70 transition-all"
                  data-ocid="profile.username_edit_button"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <Label
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#FF8C9F" }}
            >
              Name
            </Label>
            {editingName ? (
              <div className="flex gap-2 mt-1">
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-full text-sm outline-none"
                  style={{
                    background: darkMode ? "#1a1a1a" : "#FFF5F8",
                    border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
                    color: darkMode ? "#f5f5f5" : "#1E1E1E",
                  }}
                  data-ocid="profile.input"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                  style={{ background: saving ? "#FFB6C8" : "#FF8C9F" }}
                  data-ocid="profile.save_button"
                >
                  {saving ? "✿" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(name);
                    setEditingName(false);
                  }}
                  className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-85 transition-all"
                  style={{
                    background: "#F5F0FF",
                    color: darkMode ? "#888" : "#7A6E6E",
                  }}
                  data-ocid="profile.cancel_button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span
                  className="text-base font-semibold"
                  style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
                >
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(name);
                    setEditingName(true);
                  }}
                  className="text-sm hover:opacity-70 transition-all"
                  data-ocid="profile.edit_button"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>

          <div>
            <Label
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#FF8C9F" }}
            >
              Phone
            </Label>
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
            >
              {currentUser?.phone ?? "+-- --- -----"}
            </p>
          </div>

          {/* About */}
          <div>
            <Label
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#FF8C9F" }}
            >
              About
            </Label>
            {editingAbout ? (
              <div className="flex gap-2 mt-1">
                <input
                  value={tempAbout}
                  onChange={(e) => setTempAbout(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-full text-sm outline-none"
                  style={{
                    background: darkMode ? "#1a1a1a" : "#FFF5F8",
                    border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
                    color: darkMode ? "#f5f5f5" : "#1E1E1E",
                  }}
                  data-ocid="profile.textarea"
                />
                <button
                  type="button"
                  onClick={handleSaveAbout}
                  disabled={saving}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                  style={{ background: saving ? "#FFB6C8" : "#FF8C9F" }}
                  data-ocid="profile.about_save_button"
                >
                  {saving ? "✿" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempAbout(about);
                    setEditingAbout(false);
                  }}
                  className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-85 transition-all"
                  style={{
                    background: "#F5F0FF",
                    color: darkMode ? "#888" : "#7A6E6E",
                  }}
                  data-ocid="profile.about_cancel_button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span
                  className="text-sm"
                  style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
                >
                  {about}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempAbout(about);
                    setEditingAbout(true);
                  }}
                  className="text-sm hover:opacity-70 transition-all"
                  data-ocid="profile.about_edit_button"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div
          className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "#FFFAF5",
            border: "1.5px solid #E8DFFF",
            boxShadow: "0 4px 20px rgba(200,160,255,0.1)",
          }}
        >
          <h2
            className="font-bold text-base"
            style={{ color: darkMode ? "#f5f5f5" : "#1E1E1E" }}
          >
            🔒 Privacy
          </h2>
          <div className="flex items-center justify-between">
            <Label
              className="text-sm font-semibold"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
            >
              Last Seen
            </Label>
            <Switch
              checked={lastSeen}
              onCheckedChange={setLastSeen}
              data-ocid="profile.last_seen.switch"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              className="text-sm font-semibold"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
            >
              Profile Photo Visibility
            </Label>
            <Switch
              checked={profilePhoto}
              onCheckedChange={setProfilePhoto}
              data-ocid="profile.profile_photo.switch"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              className="text-sm font-semibold"
              style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
            >
              Read Receipts
            </Label>
            <Switch
              checked={readReceipts}
              onCheckedChange={setReadReceipts}
              data-ocid="profile.read_receipts.switch"
            />
          </div>
        </div>

        {currentUser?.isAdmin && (
          <button
            type="button"
            onClick={() => onNav("admin")}
            data-ocid="profile.admin_panel.button"
            className="w-full max-w-md flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:opacity-85"
            style={{
              background: "linear-gradient(135deg, #FFD1DC 0%, #E8DFFF 100%)",
              border: "1.5px solid #FF8C9F",
            }}
          >
            <span className="font-bold text-sm" style={{ color: "#FF8C9F" }}>
              👑 Admin Panel
            </span>
            <span style={{ color: "#FF8C9F" }}>›</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onNav("settings")}
          data-ocid="profile.settings.button"
          className="w-full max-w-md flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:opacity-85"
          style={{
            background: darkMode ? "#1a1a1a" : "#FFFAF5",
            border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
          }}
        >
          <span
            className="font-semibold text-sm"
            style={{ color: darkMode ? "#aaa" : "#5A4E4E" }}
          >
            ⚙️ Settings
          </span>
          <span style={{ color: "#FF8C9F" }}>›</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          data-ocid="profile.logout_bottom.button"
          className="w-full max-w-md flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-all hover:opacity-85"
          style={{
            background: "#FFF0F4",
            border: `1.5px solid ${darkMode ? "#333" : "#FFD1DC"}`,
          }}
        >
          <span className="font-semibold text-sm" style={{ color: "#C0304A" }}>
            👋 Logout
          </span>
        </button>
      </div>

      <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
    </div>
  );
}
