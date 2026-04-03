import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import type { View } from "../App";
import BottomNav from "./BottomNav";

type SubScreen =
  | null
  | "privacy"
  | "security"
  | "change-number"
  | "wallpaper"
  | "backup"
  | "font-size"
  | "tones"
  | "home-theme";

const wallpapers = [
  {
    id: "default",
    label: "Pastel Dream",
    bg: "linear-gradient(135deg, #FFE6DB 0%, #E8DFFF 100%)",
  },
  {
    id: "pink",
    label: "Pink Cloud",
    bg: "linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 100%)",
  },
  {
    id: "mint",
    label: "Mint Fresh",
    bg: "linear-gradient(135deg, #A0FFCA 0%, #E8DFFF 100%)",
  },
  {
    id: "blue",
    label: "Sky Bliss",
    bg: "linear-gradient(135deg, #C1E1FF 0%, #E8DFFF 100%)",
  },
];

const homeThemes = [
  {
    id: "default",
    label: "Light Pastel 🌸",
    bg: "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
  },
  {
    id: "dark-purple",
    label: "Deep Purple 💜",
    bg: "linear-gradient(135deg, #2D1B4E 0%, #4A2C6B 50%, #3B1F5A 100%)",
  },
  {
    id: "dark-blue",
    label: "Midnight Blue 🌌",
    bg: "linear-gradient(135deg, #0F1B3D 0%, #1A2C5E 50%, #142244 100%)",
  },
  {
    id: "dark-pink",
    label: "Dark Rose 🌹",
    bg: "linear-gradient(135deg, #3D1425 0%, #6B2040 50%, #4A1530 100%)",
  },
  {
    id: "neon-cute",
    label: "Galaxy Dark 🌠",
    bg: "linear-gradient(135deg, #1A0533 0%, #2D0E5C 30%, #1A2050 60%, #0D3340 100%)",
  },
  {
    id: "forest",
    label: "Dark Forest 🌿",
    bg: "linear-gradient(135deg, #0A2A1A 0%, #1A4A2A 50%, #0D3320 100%)",
  },
  {
    id: "sunset",
    label: "Vibrant Sunset 🌅",
    bg: "linear-gradient(135deg, #FF6B35 0%, #F7931E 30%, #FFD700 60%, #FF6B9D 100%)",
  },
  {
    id: "cotton-candy",
    label: "Cotton Candy 🍭",
    bg: "linear-gradient(135deg, #FFB3DE 0%, #B3D9FF 50%, #FFB3F7 100%)",
  },
  {
    id: "sakura",
    label: "Sakura Bloom 🌸",
    bg: "linear-gradient(135deg, #FFD6E8 0%, #FFADC7 50%, #FF85A8 100%)",
  },
  {
    id: "mint-dream",
    label: "Mint Dream 🍃",
    bg: "linear-gradient(135deg, #A8F5D3 0%, #C8F5E8 50%, #B8E8FF 100%)",
  },
  {
    id: "lavender",
    label: "Lavender Fields 💜",
    bg: "linear-gradient(135deg, #E8CCFF 0%, #D4A8FF 50%, #F5CCFF 100%)",
  },
  {
    id: "peach-blossom",
    label: "Peach Blossom 🍑",
    bg: "linear-gradient(135deg, #FFD9A8 0%, #FFBFA8 50%, #FFD1DC 100%)",
  },
  {
    id: "bubblegum",
    label: "Bubblegum 🫧",
    bg: "linear-gradient(135deg, #FF6EB4 0%, #FF94C8 50%, #FFB3DC 100%)",
  },
  {
    id: "rainbow-sherbet",
    label: "Rainbow Sherbet 🌈",
    bg: "linear-gradient(135deg, #FFB3BA 0%, #FFDFBA 30%, #FFFFBA 50%, #BAFFBA 70%, #BAE8FF 100%)",
  },
  {
    id: "strawberry-milk",
    label: "Strawberry Milk 🍓",
    bg: "linear-gradient(135deg, #FFE4EC 0%, #FFB3C8 50%, #FFDDE8 100%)",
  },
  {
    id: "sky-candy",
    label: "Sky Candy ☁️",
    bg: "linear-gradient(135deg, #A8D8FF 0%, #C8EAFF 50%, #E8D4FF 100%)",
  },
  {
    id: "honey-bee",
    label: "Honey Bee 🍯",
    bg: "linear-gradient(135deg, #FFE066 0%, #FFB347 50%, #FFF0A0 100%)",
  },
];

const tones = [
  "Chirp 🎵",
  "Bubble Pop 🫧",
  "Soft Bell 🔔",
  "Kawaii Chime ✨",
  "Heartbeat 💓",
];

const SETTINGS_BG = "linear-gradient(160deg, #FFF5FA 0%, #E8F0FF 100%)";

interface SettingsViewProps {
  onBack: () => void;
  onNav: (v: View) => void;
  homeTheme: string;
  onHomeThemeChange: (theme: string) => void;
  darkMode?: boolean;
  onDarkModeChange?: (val: boolean) => void;
}

export default function SettingsView({
  onBack,
  onNav,
  homeTheme,
  onHomeThemeChange,
  darkMode = false,
  onDarkModeChange,
}: SettingsViewProps) {
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [msgNotif, setMsgNotif] = useState(true);
  const [groupNotif, setGroupNotif] = useState(true);
  const [wifiDownload, setWifiDownload] = useState(true);
  const [mobileDownload, setMobileDownload] = useState(false);
  const [fontSize, setFontSize] = useState([14]);
  const [selectedWallpaper, setSelectedWallpaper] = useState("default");
  const [selectedTone, setSelectedTone] = useState("Chirp 🎵");
  const [newNumber, setNewNumber] = useState("");
  // privacy toggles
  const [lastSeen, setLastSeen] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const dm = darkMode;
  const bg = dm ? "#0d0d0d" : SETTINGS_BG;
  const cardBg = dm ? "#1a1a1a" : "#FFFAF5";
  const borderColor = dm ? "#333" : "#FFD1DC";
  const textPrimary = dm ? "#f5f5f5" : "#1E1E1E";
  const textSecondary = dm ? "#aaa" : "#5A4E4E";
  const rowBorder = dm ? "1px solid #333" : "1px solid #FFE6DB";
  const headerBg = dm ? "#111" : "#FFFAF5";
  const headerBorder = dm ? "#333" : "#FFD1DC";
  const backBtnBg = dm ? "#222" : "#FFF0F4";

  const sectionCard = (children: React.ReactNode) => (
    <div
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{ background: cardBg, border: `1.5px solid ${borderColor}` }}
    >
      {children}
    </div>
  );

  const settingRow = (
    icon: string,
    label: string,
    onClick: () => void,
    ocid: string,
    last = false,
  ) => (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:opacity-80 transition-all"
      style={{ borderBottom: last ? "none" : rowBorder }}
    >
      <span className="text-xl">{icon}</span>
      <span
        className="flex-1 text-sm font-semibold"
        style={{ color: textPrimary }}
      >
        {label}
      </span>
      <span style={{ color: "#FF8C9F" }}>›</span>
    </button>
  );

  const backHeader = (title: string) => (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: headerBg,
        borderBottom: `1.5px solid ${headerBorder}`,
      }}
    >
      <button
        type="button"
        onClick={() => setSubScreen(null)}
        data-ocid="settings.back.button"
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:opacity-70 transition-all"
        style={{ background: backBtnBg, color: "#FF8C9F" }}
      >
        ←
      </button>
      <h1 className="text-xl font-bold" style={{ color: "#FF8C9F" }}>
        {title}
      </h1>
    </div>
  );

  if (subScreen === "privacy") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Privacy 🔒")}
        <div className="flex flex-col items-center px-5 py-6 gap-4">
          {sectionCard(
            <>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: rowBorder }}
              >
                <Label
                  className="text-sm font-semibold"
                  style={{ color: textSecondary }}
                >
                  Last Seen
                </Label>
                <Switch
                  checked={lastSeen}
                  onCheckedChange={setLastSeen}
                  data-ocid="settings.last_seen.switch"
                />
              </div>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: rowBorder }}
              >
                <Label
                  className="text-sm font-semibold"
                  style={{ color: textSecondary }}
                >
                  Profile Photo
                </Label>
                <Switch
                  checked={profilePhoto}
                  onCheckedChange={setProfilePhoto}
                  data-ocid="settings.profile_photo.switch"
                />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <Label
                  className="text-sm font-semibold"
                  style={{ color: textSecondary }}
                >
                  Read Receipts
                </Label>
                <Switch
                  checked={readReceipts}
                  onCheckedChange={setReadReceipts}
                  data-ocid="settings.read_receipts.switch"
                />
              </div>
            </>,
          )}
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "security") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Security 🔐")}
        <div className="flex flex-col items-center px-5 py-8">
          <div
            className="w-full max-w-md rounded-2xl p-6 text-center"
            style={{ background: cardBg, border: `1.5px solid ${borderColor}` }}
          >
            <span className="text-5xl">🔐</span>
            <p
              className="mt-4 font-semibold text-sm"
              style={{ color: textSecondary }}
            >
              Two-step verification keeps your account secure with a PIN when
              registering on a new device.
            </p>
            <button
              type="button"
              className="mt-5 px-6 py-2.5 rounded-full text-sm font-bold text-white hover:opacity-85 transition-all"
              style={{ background: "#FF8C9F" }}
              data-ocid="settings.security.primary_button"
            >
              Enable 2-Step Verification
            </button>
          </div>
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "change-number") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Change Number 📱")}
        <div className="flex flex-col items-center px-5 py-8 gap-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: cardBg, border: `1.5px solid ${borderColor}` }}
          >
            <p className="text-sm" style={{ color: textSecondary }}>
              Enter your new phone number to migrate your account.
            </p>
            <input
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-3 rounded-full text-sm outline-none"
              style={{
                background: "#FFF5F8",
                border: "1.5px solid #FFD1DC",
                color: textPrimary,
              }}
              data-ocid="settings.change_number.input"
            />
            <button
              type="button"
              className="w-full py-3 rounded-full text-sm font-bold text-white hover:opacity-85 transition-all"
              style={{ background: "#FF8C9F" }}
              data-ocid="settings.change_number.submit_button"
            >
              Continue ›
            </button>
          </div>
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "wallpaper") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Wallpaper 🖼️")}
        <div className="flex flex-col items-center px-5 py-6 gap-4">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {wallpapers.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWallpaper(w.id)}
                data-ocid={`settings.wallpaper.item.${i + 1}`}
                className="flex flex-col gap-2 p-3 rounded-2xl transition-all hover:opacity-85"
                style={{
                  background: "#FFFAF5",
                  border:
                    selectedWallpaper === w.id
                      ? "2.5px solid #FF8C9F"
                      : "1.5px solid #FFD1DC",
                  boxShadow:
                    selectedWallpaper === w.id ? "0 0 12px #FF8C9F44" : "none",
                }}
              >
                <div className="h-24 rounded-xl" style={{ background: w.bg }} />
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: selectedWallpaper === w.id ? "#FF8C9F" : "#5A4E4E",
                  }}
                >
                  {selectedWallpaper === w.id ? "✓ " : ""}
                  {w.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "home-theme") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Home Theme 🎨")}
        <div className="flex flex-col items-center px-5 py-6 gap-4">
          <p
            className="text-xs font-semibold w-full max-w-md"
            style={{ color: textSecondary }}
          >
            Choose a background theme for your home screen
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {homeThemes.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onHomeThemeChange(t.id);
                }}
                data-ocid={`settings.home_theme.item.${i + 1}`}
                className="flex flex-col gap-2 p-3 rounded-2xl transition-all hover:opacity-85"
                style={{
                  background: "#FFFAF5",
                  border:
                    homeTheme === t.id
                      ? "2.5px solid #FF8C9F"
                      : "1.5px solid #FFD1DC",
                  boxShadow: homeTheme === t.id ? "0 0 12px #FF8C9F44" : "none",
                }}
              >
                <div className="h-20 rounded-xl" style={{ background: t.bg }} />
                <span
                  className="text-xs font-semibold text-left"
                  style={{ color: homeTheme === t.id ? "#FF8C9F" : "#5A4E4E" }}
                >
                  {homeTheme === t.id ? "✓ " : ""}
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "backup") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Chat Backup ☁️")}
        <div className="flex flex-col items-center px-5 py-8">
          <div
            className="w-full max-w-md rounded-2xl p-6 text-center"
            style={{ background: cardBg, border: `1.5px solid ${borderColor}` }}
          >
            <span className="text-5xl">☁️</span>
            <p className="mt-3 font-bold" style={{ color: textPrimary }}>
              Last Backup
            </p>
            <p className="mt-1 text-sm" style={{ color: textSecondary }}>
              Today at 3:20 PM · 12.4 MB
            </p>
            <button
              type="button"
              className="mt-5 px-6 py-2.5 rounded-full text-sm font-bold text-white hover:opacity-85 transition-all"
              style={{ background: "#FF8C9F" }}
              data-ocid="settings.backup.primary_button"
            >
              Backup Now
            </button>
          </div>
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "font-size") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Font Size 🔤")}
        <div className="flex flex-col items-center px-5 py-8 gap-6">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-6"
            style={{ background: cardBg, border: `1.5px solid ${borderColor}` }}
          >
            <p
              style={{
                fontSize: `${fontSize[0]}px`,
                color: textPrimary,
                fontWeight: 600,
              }}
            >
              Preview: Hello, Lily! 🌸 This is how your chat text will look.
            </p>
            <div className="flex flex-col gap-3">
              <div
                className="flex justify-between text-xs font-bold"
                style={{ color: "#FF8C9F" }}
              >
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
              </div>
              <Slider
                min={11}
                max={20}
                step={1}
                value={fontSize}
                onValueChange={setFontSize}
                data-ocid="settings.font_size.select"
              />
            </div>
            <p className="text-xs text-center" style={{ color: "#aaa" }}>
              Current: {fontSize[0]}px
            </p>
          </div>
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  if (subScreen === "tones") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: bg,
          fontFamily: "'Quicksand', sans-serif",
          paddingBottom: "80px",
        }}
      >
        {backHeader("Custom Tones 🎵")}
        <div className="flex flex-col items-center px-5 py-6">
          {sectionCard(
            tones.map((tone, i) => (
              <button
                key={tone}
                type="button"
                onClick={() => setSelectedTone(tone)}
                data-ocid={`settings.tone.item.${i + 1}`}
                className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition-all"
                style={{
                  borderBottom:
                    i < tones.length - 1 ? "1px solid #FFE6DB" : "none",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: textPrimary }}
                >
                  {tone}
                </span>
                {selectedTone === tone && (
                  <span style={{ color: "#FF8C9F" }}>✓</span>
                )}
              </button>
            )),
          )}
        </div>
        <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
      </div>
    );
  }

  // Main settings screen
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: bg,
        fontFamily: "'Quicksand', sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: headerBg,
          borderBottom: `1.5px solid ${headerBorder}`,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="settings.back.button"
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:opacity-70 transition-all"
          style={{ background: backBtnBg, color: "#FF8C9F" }}
        >
          ←
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#FF8C9F" }}>
          Settings ⚙️
        </h1>
      </div>

      <div className="flex flex-col items-center px-5 py-6 gap-5">
        {/* Account */}
        <div className="w-full max-w-md">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
            style={{ color: "#FF8C9F" }}
          >
            Account
          </p>
          {sectionCard(
            <>
              {settingRow(
                "🔒",
                "Privacy",
                () => setSubScreen("privacy"),
                "settings.privacy.button",
              )}
              {settingRow(
                "🔐",
                "Security",
                () => setSubScreen("security"),
                "settings.security.button",
              )}
              {settingRow(
                "📱",
                "Change Number",
                () => setSubScreen("change-number"),
                "settings.change_number.button",
                true,
              )}
            </>,
          )}
        </div>

        {/* Chats */}
        <div className="w-full max-w-md">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
            style={{ color: "#FF8C9F" }}
          >
            Chats
          </p>
          {sectionCard(
            <>
              {settingRow(
                "🖼️",
                "Wallpaper",
                () => setSubScreen("wallpaper"),
                "settings.wallpaper.button",
              )}
              {settingRow(
                "☁️",
                "Chat Backup",
                () => setSubScreen("backup"),
                "settings.backup.button",
              )}
              {settingRow(
                "🔤",
                "Font Size",
                () => setSubScreen("font-size"),
                "settings.font_size.button",
              )}
              {settingRow(
                "🎨",
                "Home Theme",
                () => setSubScreen("home-theme"),
                "settings.home_theme.button",
              )}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "none" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <Label
                    className="text-sm font-semibold cursor-pointer"
                    style={{ color: textPrimary }}
                  >
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={onDarkModeChange}
                  data-ocid="settings.dark_mode.switch"
                />
              </div>
            </>,
          )}
        </div>

        {/* Notifications */}
        <div className="w-full max-w-md">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
            style={{ color: "#FF8C9F" }}
          >
            Notifications
          </p>
          {sectionCard(
            <>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: rowBorder }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <Label
                    className="text-sm font-semibold cursor-pointer"
                    style={{ color: textPrimary }}
                  >
                    Message Notifications
                  </Label>
                </div>
                <Switch
                  checked={msgNotif}
                  onCheckedChange={setMsgNotif}
                  data-ocid="settings.msg_notif.switch"
                />
              </div>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: rowBorder }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <Label
                    className="text-sm font-semibold cursor-pointer"
                    style={{ color: textPrimary }}
                  >
                    Group Notifications
                  </Label>
                </div>
                <Switch
                  checked={groupNotif}
                  onCheckedChange={setGroupNotif}
                  data-ocid="settings.group_notif.switch"
                />
              </div>
              {settingRow(
                "🎵",
                "Custom Tones",
                () => setSubScreen("tones"),
                "settings.tones.button",
                true,
              )}
            </>,
          )}
        </div>

        {/* Data & Storage */}
        <div className="w-full max-w-md">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
            style={{ color: "#FF8C9F" }}
          >
            Data & Storage
          </p>
          {sectionCard(
            <>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: rowBorder }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📶</span>
                  <Label
                    className="text-sm font-semibold cursor-pointer"
                    style={{ color: textPrimary }}
                  >
                    Auto-Download on Wi-Fi
                  </Label>
                </div>
                <Switch
                  checked={wifiDownload}
                  onCheckedChange={setWifiDownload}
                  data-ocid="settings.wifi_download.switch"
                />
              </div>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: rowBorder }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <Label
                    className="text-sm font-semibold cursor-pointer"
                    style={{ color: textPrimary }}
                  >
                    Auto-Download on Mobile
                  </Label>
                </div>
                <Switch
                  checked={mobileDownload}
                  onCheckedChange={setMobileDownload}
                  data-ocid="settings.mobile_download.switch"
                />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💾</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: textPrimary }}
                  >
                    Storage Usage
                  </span>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: "#FF8C9F" }}
                >
                  124 MB
                </span>
              </div>
            </>,
          )}
        </div>
      </div>

      <BottomNav active="account" onNav={onNav} darkMode={darkMode} />
    </div>
  );
}
