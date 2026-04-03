import { useEffect, useRef, useState } from "react";
import type { PublicUser } from "./backend.d";
import ActiveChat from "./components/ActiveChat";
import AdminView from "./components/AdminView";
import CentralDashboard from "./components/CentralDashboard";
import ChatList from "./components/ChatList";
import ChatPanel from "./components/ChatPanel";
import FeaturedCreations from "./components/FeaturedCreations";
import Footer from "./components/Footer";
import LeftSidebar from "./components/LeftSidebar";
import LoginScreen from "./components/LoginScreen";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import SplashScreen from "./components/SplashScreen";
import TopNav from "./components/TopNav";
import { getActor } from "./lib/actor";

export type View =
  | "splash"
  | "login"
  | "home"
  | "chatList"
  | "activeChat"
  | "profile"
  | "settings"
  | "admin";

export type Message = {
  id: number;
  sender: string;
  side: "left" | "right";
  text: string;
  time: string;
  image?: string;
  imageUrl?: string;
  status?: "sent" | "delivered" | "read";
};

const HOME_THEMES: Record<string, string> = {
  default: "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
  "dark-purple":
    "linear-gradient(135deg, #2D1B4E 0%, #4A2C6B 50%, #3B1F5A 100%)",
  "dark-blue": "linear-gradient(135deg, #0F1B3D 0%, #1A2C5E 50%, #142244 100%)",
  "dark-pink": "linear-gradient(135deg, #3D1425 0%, #6B2040 50%, #4A1530 100%)",
  "neon-cute":
    "linear-gradient(135deg, #1A0533 0%, #2D0E5C 30%, #1A2050 60%, #0D3340 100%)",
  forest: "linear-gradient(135deg, #0A2A1A 0%, #1A4A2A 50%, #0D3320 100%)",
  sunset:
    "linear-gradient(135deg, #FF6B35 0%, #F7931E 30%, #FFD700 60%, #FF6B9D 100%)",
};

const serializeUser = (user: PublicUser): string => {
  return JSON.stringify(user, (_, value) =>
    typeof value === "bigint" ? `__bigint__${value.toString()}` : value,
  );
};

const deserializeUser = (raw: string): PublicUser | null => {
  try {
    return JSON.parse(raw, (_, value) => {
      if (typeof value === "string" && value.startsWith("__bigint__")) {
        return BigInt(value.slice(10));
      }
      return value;
    }) as PublicUser;
  } catch {
    return null;
  }
};

// PWA Install Banner Component
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const dismissed = useRef(false);

  useEffect(() => {
    // Don't show if already installed or dismissed before
    const alreadyDismissed = localStorage.getItem("chatme_install_dismissed");
    if (alreadyDismissed) return;

    // Check if already running as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed.current) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (deferredPrompt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      localStorage.setItem("chatme_install_dismissed", "1");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    dismissed.current = true;
    setShowBanner(false);
    localStorage.setItem("chatme_install_dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "linear-gradient(135deg, #ff80ab, #ea80fc)",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(240,98,146,0.45)",
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        minWidth: 290,
        maxWidth: 340,
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <img
        src="/assets/generated/chat-me-pwa-icon.dim_512x512.png"
        alt="Chat Me"
        style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 2,
          }}
        >
          📲 Install Chat Me
        </div>
        <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 12 }}>
          Home screen pe add karo — app jaisa feel!
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          type="button"
          onClick={handleInstall}
          style={{
            background: "#fff",
            color: "#e91e8c",
            border: "none",
            borderRadius: 10,
            padding: "5px 14px",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Quicksand', sans-serif",
          }}
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: "transparent",
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 10,
            padding: "4px 14px",
            fontWeight: 600,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "'Quicksand', sans-serif",
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("splash");
  const [activeChatName, setActiveChatName] = useState<string>("Art Buddies");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [dpUrl, setDpUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [homeTheme, setHomeTheme] = useState<string>(
    () => localStorage.getItem("chatme_home_theme") || "default",
  );
  const [darkMode, setDarkMode] = useState<boolean>(
    () => localStorage.getItem("chatme_dark_mode") === "1",
  );

  // Apply dark mode class on mount
  useEffect(() => {
    if (localStorage.getItem("chatme_dark_mode") === "1") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleDarkModeChange = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("chatme_dark_mode", val ? "1" : "0");
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const savedToken = localStorage.getItem("chatme_token");
      if (!savedToken) {
        setView("login");
        return;
      }
      try {
        const actor = await getActor();
        const profileResult = await actor.getMyProfile(savedToken);
        if (profileResult && profileResult.length > 0) {
          const freshUser = profileResult[0] as PublicUser;
          setToken(savedToken);
          setCurrentUser(freshUser);
          setDpUrl(freshUser.avatarUrl || null);
          localStorage.setItem("chatme_user", serializeUser(freshUser));
          setView("home");
        } else {
          localStorage.removeItem("chatme_token");
          localStorage.removeItem("chatme_user");
          setView("login");
        }
      } catch {
        const savedUser = localStorage.getItem("chatme_user");
        if (savedUser) {
          const user = deserializeUser(savedUser);
          if (user) {
            setToken(savedToken);
            setCurrentUser(user);
            setDpUrl(user.avatarUrl || null);
            setView("home");
            return;
          }
        }
        setView("login");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (tok: string, user: PublicUser) => {
    setToken(tok);
    setCurrentUser(user);
    setDpUrl(user.avatarUrl || null);
    localStorage.setItem("chatme_token", tok);
    localStorage.setItem("chatme_user", serializeUser(user));
    setView("home");
  };

  const handleLogout = async () => {
    if (token) {
      try {
        const actor = await getActor();
        await actor.logout(token);
      } catch {
        // ignore
      }
    }
    setToken(null);
    setCurrentUser(null);
    setDpUrl(null);
    localStorage.removeItem("chatme_token");
    localStorage.removeItem("chatme_user");
    setView("login");
  };

  const handleHomeThemeChange = (theme: string) => {
    setHomeTheme(theme);
    localStorage.setItem("chatme_home_theme", theme);
  };

  const openChat = (chatId: string, displayName: string) => {
    setActiveChatId(chatId);
    setActiveChatName(displayName);
    setView("activeChat");
  };

  if (view === "splash") return <SplashScreen darkMode={darkMode} />;
  if (view === "login")
    return (
      <>
        <LoginScreen onLogin={handleLogin} darkMode={darkMode} />
        <InstallBanner />
      </>
    );

  if (view === "admin" && token) {
    return (
      <AdminView
        token={token}
        onBack={() => setView("home")}
        onNav={setView}
        darkMode={darkMode}
      />
    );
  }

  if (view === "home") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: darkMode
            ? "#0d0d0d"
            : (HOME_THEMES[homeTheme] ?? HOME_THEMES.default),
          minWidth: "1200px",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        <TopNav
          activeTab="Home"
          dpUrl={dpUrl}
          currentUser={currentUser}
          darkMode={darkMode}
          onNav={(tab) => {
            if (tab === "Chat") setView("chatList");
            else if (tab === "Account") setView("profile");
            else if (tab === "Settings") setView("settings");
            else if (tab === "Admin") setView("admin");
          }}
        />
        <main
          className="flex gap-5 px-6 py-5 flex-1 items-start"
          style={{ minWidth: "1200px" }}
        >
          <LeftSidebar
            token={token ?? ""}
            darkMode={darkMode}
            currentUserId={currentUser?.id}
            onOpenChat={(chatId) => {
              if (chatId.startsWith("dm_")) {
                openChat(chatId, chatId);
              } else {
                openChat(
                  `group_${chatId.toLowerCase().replace(/ /g, "_")}`,
                  chatId,
                );
              }
            }}
          />
          <CentralDashboard
            darkMode={darkMode}
            onJoinChat={(name) =>
              openChat(`group_${name.toLowerCase().replace(/ /g, "_")}`, name)
            }
            currentUser={currentUser}
          />
          <ChatPanel
            chatName="Art Buddies"
            messages={[]}
            darkMode={darkMode}
            onSend={() => {}}
            onOpenChat={() => openChat("group_art_buddies", "Art Buddies")}
          />
          <FeaturedCreations darkMode={darkMode} />
        </main>
        <Footer darkMode={darkMode} />
        <button
          type="button"
          onClick={() => setView("chatList")}
          data-ocid="home.open_modal_button"
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-white text-2xl flex items-center justify-center shadow-soft transition-all hover:opacity-85 hover:scale-110"
          style={{ background: "#FF8C9F", zIndex: 100 }}
          title="New Chat"
        >
          +
        </button>
        <InstallBanner />
      </div>
    );
  }

  if (view === "chatList") {
    return (
      <>
        <ChatList
          token={token ?? ""}
          currentUser={currentUser}
          onOpenChat={openChat}
          onNav={setView}
          activeChatId={activeChatId || null}
          darkMode={darkMode}
        />
        <InstallBanner />
      </>
    );
  }

  if (view === "activeChat") {
    return (
      <ActiveChat
        chatId={activeChatId}
        chatName={activeChatName}
        token={token ?? ""}
        currentUser={currentUser}
        onBack={() => setView("chatList")}
        onNav={setView}
        darkMode={darkMode}
      />
    );
  }

  if (view === "profile") {
    return (
      <ProfileView
        dpUrl={dpUrl}
        onDpChange={(url) => {
          setDpUrl(url);
          if (currentUser) {
            const updated = { ...currentUser, avatarUrl: url };
            setCurrentUser(updated);
            localStorage.setItem("chatme_user", serializeUser(updated));
          }
        }}
        token={token ?? ""}
        currentUser={currentUser}
        onBack={() => setView("home")}
        onNav={setView}
        onLogout={handleLogout}
        darkMode={darkMode}
        onUserUpdate={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem("chatme_user", serializeUser(updated));
        }}
      />
    );
  }

  if (view === "settings") {
    return (
      <SettingsView
        onBack={() => setView("home")}
        onNav={setView}
        homeTheme={homeTheme}
        onHomeThemeChange={handleHomeThemeChange}
        darkMode={darkMode}
        onDarkModeChange={handleDarkModeChange}
      />
    );
  }

  return null;
}
