import { useEffect, useState } from "react";
import type { PublicUser } from "../backend.d";
import { getActor } from "../lib/actor";

interface LoginScreenProps {
  onLogin: (token: string, user: PublicUser) => void;
}

type Tab = "login" | "register";

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDemoBtn, setShowDemoBtn] = useState(false);

  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regUsername, setRegUsername] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameChecking, setUsernameChecking] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.7)",
    border: "1.5px solid #FFD1DC",
    borderRadius: "50px",
    padding: "12px 20px",
    fontSize: "15px",
    color: "#1E1E1E",
    outline: "none",
    width: "100%",
    fontFamily: "'Quicksand', sans-serif",
    backdropFilter: "blur(8px)",
    boxSizing: "border-box" as const,
  };

  // Debounced username availability check
  useEffect(() => {
    if (!regUsername || regUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(regUsername)) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const actor = await getActor();
        const available = await actor.isUsernameAvailablePublic(regUsername);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [regUsername]);

  const enterDemoMode = (username: string, name: string) => {
    const uname = username || "demo_user";
    const dname = name || "Demo User";
    const demoToken = `demo-${uname}-${Date.now()}`;
    const fakeUser: PublicUser = {
      id: BigInt(1),
      username: uname,
      name: dname,
      about: "Demo account",
      avatarUrl: "",
      phone: "",
      joinedAt: BigInt(Date.now()),
      isAdmin: false,
    };
    onLogin(demoToken, fakeUser);
  };

  const handleLogin = async () => {
    const uname = loginUsername.trim();
    const pass = loginPassword.trim();
    if (!uname) {
      setError("Please enter your username 💕");
      return;
    }
    if (!pass) {
      setError("Please enter your password 🔑");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setShowDemoBtn(false);
    try {
      const actor = await getActor();
      const result = await actor.loginWithPassword(uname, pass);
      if ("ok" in result) {
        onLogin(result.ok.token, result.ok.user);
      } else {
        setError(`${result.err} ❌`);
      }
    } catch {
      setError("Could not reach server. Please try again 📡");
      setShowDemoBtn(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const uname = regUsername.trim();
    const name = regName.trim();
    const pass = regPassword.trim();
    const passConfirm = regPasswordConfirm.trim();

    if (!uname || uname.length < 3) {
      setError("Username must be at least 3 characters ✨");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      setError("Username: letters, numbers, underscore only (3-20 chars) 💕");
      return;
    }
    if (usernameAvailable === false) {
      setError("That username is already taken 💔");
      return;
    }
    if (!name) {
      setError("Please enter your display name 🌸");
      return;
    }
    if (pass.length < 4) {
      setError("Password must be at least 4 characters 🔑");
      return;
    }
    if (pass !== passConfirm) {
      setError("Passwords do not match 💕");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    setShowDemoBtn(false);
    try {
      const actor = await getActor();
      const result = await actor.registerWithPassword(uname, pass, name);
      if ("ok" in result) {
        const profileResult = await actor.getMyProfile(result.ok.token);
        if (profileResult && profileResult.length > 0) {
          onLogin(result.ok.token, profileResult[0] as PublicUser);
        } else {
          setSuccessMsg("Account created! Please login 🌸");
          setTab("login");
        }
      } else {
        setError(`${result.err} ❌`);
      }
    } catch {
      setError("Could not reach server. Please try again 📡");
      setShowDemoBtn(true);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
    setSuccessMsg("");
    setShowDemoBtn(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      {/* Background emojis */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {["💕", "✨", "🌸", "⭐", "💫", "🎀", "💗", "🌟", "🦋", "🍓"].map(
          (e, i) => (
            <span
              key={e}
              className="absolute text-3xl"
              style={{
                opacity: 0.12,
                left: `${5 + ((i * 19) % 90)}%`,
                top: `${3 + ((i * 27) % 90)}%`,
              }}
            >
              {e}
            </span>
          ),
        )}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ boxShadow: "0 0 30px #FF8C9F66" }}
          >
            <img
              src="/assets/uploads/92b049e7e6986de0dabd5a85eb518c30-019d32cb-469c-712f-b57e-9c8879b35386-1.jpg"
              alt="Chat Me Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: "#FF8C9F" }}>
              Chat Me 💬
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7A6E6E" }}>
              Cute chats, always 🌸
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-3xl p-6 flex flex-col gap-5"
          style={{
            background: "rgba(255,250,245,0.9)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid #FFD1DC",
            boxShadow: "0 8px 40px rgba(255,140,159,0.15)",
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #FFD1DC" }}
          >
            <button
              type="button"
              onClick={() => switchTab("login")}
              className="flex-1 py-2.5 text-sm font-bold transition-all"
              style={{
                background: tab === "login" ? "#FF8C9F" : "transparent",
                color: tab === "login" ? "#fff" : "#FF8C9F",
              }}
              data-ocid="login.tab"
            >
              🔑 Login
            </button>
            <button
              type="button"
              onClick={() => switchTab("register")}
              className="flex-1 py-2.5 text-sm font-bold transition-all"
              style={{
                background: tab === "register" ? "#FF8C9F" : "transparent",
                color: tab === "register" ? "#fff" : "#FF8C9F",
              }}
              data-ocid="login.tab"
            >
              ✨ Register
            </button>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-2xl text-sm font-semibold text-center"
              style={{ background: "#FFD1DC", color: "#C0304A" }}
              data-ocid="login.error_state"
            >
              {error}
            </div>
          )}
          {showDemoBtn && (
            <button
              type="button"
              onClick={() =>
                tab === "login"
                  ? enterDemoMode(loginUsername.trim(), "")
                  : enterDemoMode(regUsername.trim(), regName.trim())
              }
              className="w-full py-3 rounded-full font-bold text-sm transition-all hover:opacity-85"
              style={{
                background: "transparent",
                border: "2px solid #FF8C9F",
                color: "#FF8C9F",
              }}
              data-ocid="login.secondary_button"
            >
              🎮 Continue in Demo Mode
            </button>
          )}
          {successMsg && (
            <div
              className="px-4 py-3 rounded-2xl text-sm font-semibold text-center"
              style={{ background: "#E8FFE8", color: "#2E8B57" }}
              data-ocid="login.success_state"
            >
              {successMsg}
            </div>
          )}

          {/* LOGIN TAB */}
          {tab === "login" && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "#FF8C9F" }}>
                  Welcome back! 💕
                </p>
                <p className="text-xs mt-1" style={{ color: "#7A6E6E" }}>
                  Enter your ID and password
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  👤 Your Username
                </span>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="your_username"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-ocid="login.input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  🔑 Password
                </span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Your password"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-ocid="login.input"
                />
              </div>
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-85"
                style={{ background: loading ? "#FFB6C8" : "#FF8C9F" }}
                data-ocid="login.primary_button"
              >
                {loading ? "✿ Logging in..." : "Login 💕"}
              </button>
              <p className="text-xs text-center" style={{ color: "#7A6E6E" }}>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className="underline font-bold"
                  style={{
                    color: "#FF8C9F",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Create an account ✨
                </button>
              </p>
            </div>
          )}

          {/* REGISTER TAB */}
          {tab === "register" && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "#FF8C9F" }}>
                  Create your account ✨
                </p>
                <p className="text-xs mt-1" style={{ color: "#7A6E6E" }}>
                  Choose your unique ID 🌸
                </p>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  👤 Choose your Username (your unique ID)
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      setUsernameAvailable(null);
                    }}
                    placeholder="e.g. arun_cool"
                    style={{ ...inputStyle, paddingRight: "110px" }}
                    maxLength={20}
                    data-ocid="login.input"
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold"
                    style={{
                      color: usernameChecking
                        ? "#aaa"
                        : usernameAvailable === true
                          ? "#2E8B57"
                          : usernameAvailable === false
                            ? "#C0304A"
                            : "transparent",
                    }}
                  >
                    {usernameChecking
                      ? "Checking..."
                      : usernameAvailable === true
                        ? "✓ Available!"
                        : usernameAvailable === false
                          ? "✗ Taken"
                          : ""}
                  </span>
                </div>
                <span className="text-xs px-2" style={{ color: "#aaa" }}>
                  3-20 chars, letters/numbers/underscore
                </span>
              </div>

              {/* Display name */}
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  ✨ Display Name
                </span>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Lily 🌸"
                  style={inputStyle}
                  data-ocid="login.input"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  🔑 Password
                </span>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  style={inputStyle}
                  data-ocid="login.input"
                />
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  🔑 Confirm Password
                </span>
                <input
                  type="password"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  data-ocid="login.input"
                />
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-85"
                style={{ background: loading ? "#FFB6C8" : "#FF8C9F" }}
                data-ocid="login.submit_button"
              >
                {loading ? "✿ Creating account..." : "Join Chat Me 🎀"}
              </button>

              <p className="text-xs text-center" style={{ color: "#7A6E6E" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className="underline font-bold"
                  style={{
                    color: "#FF8C9F",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Login 💕
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-center" style={{ color: "#7A6E6E" }}>
          Your username is your unique ID 💕
        </p>
      </div>
    </div>
  );
}
