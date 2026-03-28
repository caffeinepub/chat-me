import { useEffect, useState } from "react";
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

const deserializeUser = (str: string): PublicUser => {
  return JSON.parse(str, (_, value) => {
    if (typeof value === "string" && value.startsWith("__bigint__")) {
      return BigInt(value.slice(10));
    }
    return value;
  });
};

export default function App() {
  const [view, setView] = useState<View>("splash");
  const [activeChatName, setActiveChatName] = useState<string>("Art Buddies");
  const [dpUrl, setDpUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [homeTheme, setHomeTheme] = useState<string>(
    () => localStorage.getItem("chatme_home_theme") || "default",
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedToken = localStorage.getItem("chatme_token");
      const savedUser = localStorage.getItem("chatme_user");
      if (savedToken && savedUser) {
        try {
          const user = deserializeUser(savedUser);
          setToken(savedToken);
          setCurrentUser(user);
          setDpUrl(user.avatarUrl || null);
          setView("home");
        } catch {
          setView("login");
        }
      } else {
        setView("login");
      }
    }, 2500);
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

  const openChat = (chatName: string) => {
    setActiveChatName(chatName);
    setView("activeChat");
  };

  if (view === "splash") return <SplashScreen />;
  if (view === "login") return <LoginScreen onLogin={handleLogin} />;

  if (view === "admin" && token) {
    return (
      <AdminView token={token} onBack={() => setView("home")} onNav={setView} />
    );
  }

  if (view === "home") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: HOME_THEMES[homeTheme] ?? HOME_THEMES.default,
          minWidth: "1200px",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        <TopNav
          activeTab="Home"
          dpUrl={dpUrl}
          currentUser={currentUser}
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
          <LeftSidebar onOpenChat={openChat} />
          <CentralDashboard onJoinChat={openChat} currentUser={currentUser} />
          <ChatPanel
            chatName="Art Buddies"
            messages={[]}
            onSend={() => {}}
            onOpenChat={() => openChat("Art Buddies")}
          />
          <FeaturedCreations />
        </main>
        <Footer />
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
      </div>
    );
  }

  if (view === "chatList") {
    return (
      <ChatList
        token={token ?? ""}
        currentUser={currentUser}
        onOpenChat={openChat}
        onNav={setView}
      />
    );
  }

  if (view === "activeChat") {
    return (
      <ActiveChat
        chatName={activeChatName}
        token={token ?? ""}
        currentUser={currentUser}
        onBack={() => setView("chatList")}
        onNav={setView}
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
      />
    );
  }

  return null;
}
