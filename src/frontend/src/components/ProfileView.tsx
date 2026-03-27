import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRef, useState } from "react";
import type { View } from "../App";
import BottomNav from "./BottomNav";

interface ProfileViewProps {
  dpUrl: string | null;
  onDpChange: (url: string) => void;
  onBack: () => void;
  onNav: (v: View) => void;
}

export default function ProfileView({
  dpUrl,
  onDpChange,
  onBack,
  onNav,
}: ProfileViewProps) {
  const [name, setName] = useState("Lily' 🌸");
  const [about, setAbout] = useState("Drawing cute things everyday 🎨");
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempAbout, setTempAbout] = useState(about);
  const [lastSeen, setLastSeen] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDpClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onDpChange(url);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #FFE6DB 0%, #E8DFFF 100%)",
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: "#FFFAF5", borderBottom: "1.5px solid #FFD1DC" }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="profile.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:opacity-70 transition-all"
          style={{ background: "#FFF0F4", color: "#FF8C9F" }}
        >
          ←
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#FF8C9F" }}>
          Profile 🌸
        </h1>
      </div>

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

        {/* Info card */}
        <div
          className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "#FFFAF5",
            border: "1.5px solid #FFD1DC",
            boxShadow: "0 4px 20px rgba(255,140,159,0.1)",
          }}
        >
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
                    background: "#FFF5F8",
                    border: "1.5px solid #FFD1DC",
                    color: "#1E1E1E",
                  }}
                  data-ocid="profile.input"
                />
                <button
                  type="button"
                  onClick={() => {
                    setName(tempName);
                    setEditingName(false);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                  style={{ background: "#FF8C9F" }}
                  data-ocid="profile.save_button"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(name);
                    setEditingName(false);
                  }}
                  className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-85 transition-all"
                  style={{ background: "#F5F0FF", color: "#7A6E6E" }}
                  data-ocid="profile.cancel_button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span
                  className="text-base font-semibold"
                  style={{ color: "#1E1E1E" }}
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

          {/* Phone */}
          <div>
            <Label
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#FF8C9F" }}
            >
              Phone
            </Label>
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: "#5A4E4E" }}
            >
              +91 98765 43210
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
                    background: "#FFF5F8",
                    border: "1.5px solid #FFD1DC",
                    color: "#1E1E1E",
                  }}
                  data-ocid="profile.textarea"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAbout(tempAbout);
                    setEditingAbout(false);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-85 transition-all"
                  style={{ background: "#FF8C9F" }}
                  data-ocid="profile.about_save_button"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempAbout(about);
                    setEditingAbout(false);
                  }}
                  className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-85 transition-all"
                  style={{ background: "#F5F0FF", color: "#7A6E6E" }}
                  data-ocid="profile.about_cancel_button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm" style={{ color: "#5A4E4E" }}>
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

        {/* Privacy section */}
        <div
          className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "#FFFAF5",
            border: "1.5px solid #E8DFFF",
            boxShadow: "0 4px 20px rgba(200,160,255,0.1)",
          }}
        >
          <h2 className="font-bold text-base" style={{ color: "#1E1E1E" }}>
            🔒 Privacy
          </h2>

          <div className="flex items-center justify-between">
            <Label
              className="text-sm font-semibold"
              style={{ color: "#5A4E4E" }}
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
              style={{ color: "#5A4E4E" }}
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
              style={{ color: "#5A4E4E" }}
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

        {/* Settings shortcut */}
        <button
          type="button"
          onClick={() => onNav("settings")}
          data-ocid="profile.settings.button"
          className="w-full max-w-md flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:opacity-85"
          style={{ background: "#FFFAF5", border: "1.5px solid #FFD1DC" }}
        >
          <span className="font-semibold text-sm" style={{ color: "#5A4E4E" }}>
            ⚙️ Settings
          </span>
          <span style={{ color: "#FF8C9F" }}>›</span>
        </button>
      </div>

      <BottomNav active="account" onNav={onNav} />
    </div>
  );
}
