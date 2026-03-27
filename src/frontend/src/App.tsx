import { useEffect, useState } from "react";
import ActiveChat from "./components/ActiveChat";
import CentralDashboard from "./components/CentralDashboard";
import ChatList from "./components/ChatList";
import ChatPanel from "./components/ChatPanel";
import FeaturedCreations from "./components/FeaturedCreations";
import Footer from "./components/Footer";
import LeftSidebar from "./components/LeftSidebar";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import SplashScreen from "./components/SplashScreen";
import TopNav from "./components/TopNav";

export type View =
  | "splash"
  | "home"
  | "chatList"
  | "activeChat"
  | "profile"
  | "settings";

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

const initialMessages: Record<string, Message[]> = {
  "Art Buddies": [
    {
      id: 1,
      sender: "Lily",
      side: "left",
      text: "Hello, Icsan to oee you can cute drawing arounoi!! ❤️❤️",
      time: "2:30 PM",
      status: "read",
    },
    {
      id: 2,
      sender: "Sara",
      side: "left",
      text: "Omg I just finished this!! 🥺✨",
      time: "2:31 PM",
      image: "sara-chibi",
    },
    { id: 3, sender: "Sara", side: "left", text: "❤️", time: "2:32 PM" },
    {
      id: 4,
      sender: "Ben",
      side: "left",
      text: "Shared more image",
      time: "2:33 PM",
      image: "ben-anime",
    },
    { id: 5, sender: "Sara", side: "left", text: "💗✨😊", time: "2:34 PM" },
  ],
  "Cute Pets Corner": [
    {
      id: 1,
      sender: "Mia",
      side: "left",
      text: "Look at my fluffy cat!! 🐱💕",
      time: "1:10 PM",
    },
    {
      id: 2,
      sender: "Ben",
      side: "left",
      text: "So adorable! 😍🐾",
      time: "1:12 PM",
    },
  ],
  "Meme Madness": [
    {
      id: 1,
      sender: "Ben",
      side: "left",
      text: "This meme is too real 😂😂",
      time: "11:45 AM",
    },
    {
      id: 2,
      sender: "Sara",
      side: "left",
      text: "LMAO I felt that in my soul 💀✨",
      time: "11:46 AM",
    },
  ],
  "Cosplay Crew": [
    {
      id: 1,
      sender: "Mia",
      side: "left",
      text: "Just finished my Sailor Moon outfit!! 🌙✨",
      time: "3:20 PM",
    },
  ],
  "Book Nook": [
    {
      id: 1,
      sender: "Sara",
      side: "left",
      text: "Anyone read 'The Night Circus'? 📚✨",
      time: "10:05 AM",
    },
    {
      id: 2,
      sender: "Mia",
      side: "left",
      text: "Yes!! It's magical 🌟",
      time: "10:08 AM",
    },
  ],
  "DM: Ben": [
    {
      id: 1,
      sender: "Ben",
      side: "left",
      text: "Hey! Did you see my new artwork? 🎨",
      time: "9:30 AM",
    },
  ],
  "DM: Sara": [
    {
      id: 1,
      sender: "Sara",
      side: "left",
      text: "Hiiii 🌸 What are you drawing today?",
      time: "Yesterday",
    },
  ],
  "DM: Mia": [
    {
      id: 1,
      sender: "Mia",
      side: "left",
      text: "Can we collab on something cute? 🎀",
      time: "Mon",
    },
  ],
};

export default function App() {
  const [view, setView] = useState<View>("splash");
  const [activeChatName, setActiveChatName] = useState<string>("Art Buddies");
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(initialMessages);
  const [dpUrl, setDpUrl] = useState<string | null>(null);

  useEffect(() => {
    if (view === "splash") {
      const timer = setTimeout(() => setView("home"), 2500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const openChat = (chatName: string) => {
    setActiveChatName(chatName);
    setView("activeChat");
  };

  const sendMessage = (chatName: string, text: string, imageUrl?: string) => {
    const newId = Date.now();
    const newMsg: Message = {
      id: newId,
      sender: "You",
      side: "right",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl,
      status: "sent",
    };
    setMessages((prev) => ({
      ...prev,
      [chatName]: [...(prev[chatName] ?? []), newMsg],
    }));
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [chatName]: (prev[chatName] ?? []).map((m) =>
          m.id === newId ? { ...m, status: "delivered" } : m,
        ),
      }));
    }, 1000);
  };

  if (view === "splash") return <SplashScreen />;

  if (view === "home") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
          minWidth: "1200px",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        <TopNav
          activeTab="Home"
          dpUrl={dpUrl}
          onNav={(tab) => {
            if (tab === "Chat") setView("chatList");
            else if (tab === "Account") setView("profile");
            else if (tab === "Settings") setView("settings");
          }}
        />
        <main
          className="flex gap-5 px-6 py-5 flex-1 items-start"
          style={{ minWidth: "1200px" }}
        >
          <LeftSidebar onOpenChat={openChat} />
          <CentralDashboard onJoinChat={openChat} />
          <ChatPanel
            chatName="Art Buddies"
            messages={messages["Art Buddies"] ?? []}
            onSend={(text) => sendMessage("Art Buddies", text)}
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
    return <ChatList onOpenChat={openChat} onNav={(v) => setView(v)} />;
  }

  if (view === "activeChat") {
    return (
      <ActiveChat
        chatName={activeChatName}
        messages={messages[activeChatName] ?? []}
        onSend={(text, imageUrl) => sendMessage(activeChatName, text, imageUrl)}
        onBack={() => setView("chatList")}
        onNav={(v) => setView(v)}
      />
    );
  }

  if (view === "profile") {
    return (
      <ProfileView
        dpUrl={dpUrl}
        onDpChange={setDpUrl}
        onBack={() => setView("home")}
        onNav={(v) => setView(v)}
      />
    );
  }

  if (view === "settings") {
    return (
      <SettingsView onBack={() => setView("home")} onNav={(v) => setView(v)} />
    );
  }

  return null;
}
